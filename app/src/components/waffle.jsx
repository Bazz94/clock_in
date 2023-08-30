import { useEffect, useState, useRef, useLayoutEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Stage, Layer, Line, Text, Circle, Group, Rect, Arc } from "react-konva";

/*
  0 : After today       : transparent
  1 : No data           : Black
  2 : Perfect day       : Green
  3 : late or half day  : yellow
  4 : absent            : red
*/

const typeToCount = {
	future: 0,
	none: 1,
	perfect: 2,
	present: 3,
	absent: 4,
	current: 5,
};

function Waffle({ user, tooltipOffset }) {
	const [fromDate, setFromDate] = useState(null);
	const [toDate, setToDate] = useState(null);
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const [tooltipText, setTooltipText] = useState("");
	const [values, setValues] = useState(null);
	const ref = useRef(null);
	const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

	useEffect(() => {
		const { from, to } = getFromAndToDates();
		setFromDate(from);
		setToDate(to);
		setValues(populateEmptyDays(user.currentDay, user.days));
	}, [user.currentDay, user.days]);

	useLayoutEffect(() => {
		setDimensions({ w: ref.current.offsetWidth, h: ref.current.offsetHeight });
	}, [ref]);

	useEffect(() => {
		window.addEventListener("resize", updateDimensions);
		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, []);

	function updateDimensions() {
		if (ref) {
			setDimensions({ w: ref.current.offsetWidth, h: ref.current.offsetHeight });
		}
	}

	const handleMouseMove = (e) => {
		setTooltipPosition({ y: e.pageY, x: e.pageX });
	};

	return (
		<div className="w-full h-full min-h-[258px]" onMouseMove={handleMouseMove} ref={ref}>
			<div className="flex w-full h-full">
				{values && (
					<CalendarHeatmap
						startDate={fromDate}
						endDate={toDate}
						values={values}
						showWeekdayLabels={true}
						showOutOfRangeDays={true}
						onMouseOver={(event, value) => {
							if (!value) {
								return false;
							}
							setShowTooltip(true);
							setTooltipText({
								date: value.date,
								count: Object.keys(typeToCount).find((key) => typeToCount[key] === value.count),
							});
						}}
						onMouseLeave={(event, value) => {
							setShowTooltip(false);
						}}
						classForValue={(value) => {
							if (value == null) {
								return `color-scale-0`;
							}
							return `color-scale-${value.count}`;
						}}
					/>
				)}
				{showTooltip && (
					<span
						className={`cursor-default text-md absolute bg-white text-neutral-950 p-2 flex flex-col justify-center items-center rounded-lg animate-fadeOut`}
						style={{
							left: tooltipPosition.x - 50 + tooltipOffset.x + "px",
							top: tooltipPosition.y - 70 + tooltipOffset.y + "" + "px",
						}}
					>
						<p className="">{tooltipText.date}</p>
						<p className="">{tooltipText.count}</p>
					</span>
				)}
			</div>
			<div className="relative -top-full">
				{dimensions.w !== 0 && (
					<div
						className=""
						style={{
							position: "absolute",
							top: dimensions.h - 50,
							zIndex: 0,
						}}
					>
						<Legend dimensions={dimensions} />
					</div>
				)}
			</div>
		</div>
	);
}

export default Waffle;

function getFromAndToDates() {
	let to, from;
	const date = new Date();
	date.setDate(date.getDate() + (6 - date.getDay()));
	to = date.toISOString().split("T")[0];
	date.setDate(date.getDate() - 364 + (6 - date.getDay()));
	from = date.toISOString().split("T")[0];
	return { from: from, to: to };
}

// needs useMemo
function populateEmptyDays(currentDay, days) {
	const currentDate = new Date(currentDay.date);
	const strCurrentDate = getLocalDate(currentDate);
	const newData = [];
	const date = new Date();
	const today = new Date();
	let index = 0;
	date.setDate(date.getDate() - 364);
	for (let i = 0; i < 364; i++) {
		date.setDate(date.getDate() + 1);
		const strDate = getLocalDate(date);
		let day = { date: strDate, count: date > today ? 0 : 1 };
		if (index < days.length) {
			const dateObj = new Date(days[index].date);
			if (getLocalDate(dateObj) === strDate) {
				day.count = typeToCount[days[index].status];
				index++;
			}
		}
		if (strDate === strCurrentDate) {
			day.count = 5;
		}
		newData.push(day);
	}
	console.log(newData);
	return newData;
}

function getLocalDate(now) {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const localDate = `${year}-${month}-${day}`;
	return localDate;
}

const Legend = ({ dimensions }) => {
	const items = [
		{
			text: "Complete",
			color: "#22FFBC",
		},
		{
			text: "Partial",
			color: "#FFFF22",
		},
		{
			text: "Absent",
			color: "#FF2265",
		},
	];
	const y = 0;
	const xStart = dimensions.w / items.length;
	const xInterval = Math.max(xStart / 2, 80);
	return (
		<Stage width={dimensions.w} height={20}>
			{items.map((item, index) => (
				<Layer key={index}>
					<Text
						x={xStart + index * xInterval}
						y={y}
						text={item.text}
						fontSize={16}
						fill="#FFF"
						align="right"
						width={item.text.length * 10}
					/>
					<Circle
						x={xStart + index * xInterval + item.text.length * 10 + 10}
						y={y + 7}
						radius={6}
						fill={item.color}
					/>
				</Layer>
			))}
		</Stage>
	);
};
