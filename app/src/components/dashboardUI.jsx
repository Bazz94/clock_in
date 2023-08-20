import { useEffect, useContext, useState, useRef } from "react";
import { MyContext } from "../contexts/MyContextProvider.jsx";
import config from "../config/config.js";
import { updateDB } from "../fetch/serverRequests.jsx";

const STATUS = {
	none: "none",
	working: "working",
	break: "break",
	late: "late",
	done: "done",
};

const statusToTitle = {
	none: "None",
	working: "Working",
	break: "On Break",
	late: "Late",
	done: "Done Working",
};

const DashboardUI = ({ user, currentDay, currentDayDispatch, status, setStatus }) => {
	const { time } = useContext(MyContext);
	const [date, setDate] = useState(null);
	// const [status, setStatus] = useState(calculateCurrentEvent(currentDay));
	const [worked, setWorked] = useState(calculateWorked(currentDay));

	useEffect(() => {
		const now = new Date();
		const options = { day: "2-digit", month: "long", year: "numeric" };
		const formattedDate = now.toLocaleDateString("en-UK", options);
		setDate(formattedDate);
		const timeoutId = setTimeout(() => {
			setWorked(calculateWorked(currentDay));
			const intervalId = setInterval(() => {
				const newWorked = calculateWorked(currentDay);
				setWorked(newWorked);
			}, 1000 * 60); // 1000 ms * 60 seconds = 1 minute
			return () => clearInterval(intervalId);
		}, (60 - now.getSeconds()) * 1000);

		// Clear the timeout if the component unmounts
		return () => clearTimeout(timeoutId);
	}, []);

	function handleClockIn() {
		const date = new Date();
		if (status === STATUS.working) {
			currentDayDispatch({
				type: "set",
				clockedOut: [...currentDay.clockedOut, date.toISOString()],
			});
		} else {
			currentDayDispatch({
				type: "set",
				clockedIn: [...currentDay.clockedIn, date.toISOString()],
			});
		}
	}

	function handleBreak() {
		const date = new Date();
		if (status === STATUS.break) {
			currentDayDispatch({
				type: "set",
				endedBreak: [...currentDay.endedBreak, date.toISOString()],
			});
		}
		if (status === STATUS.working) {
			currentDayDispatch({
				type: "set",
				startedBreak: [...currentDay.startedBreak, date.toISOString()],
			});
		}
	}

	return (
		<div className="flex flex-col min-w-[350px] w-full sm:flex-row sm:h-full">
			<div className="flex flex-col items-center justify-center w-full h-full px-5 sm:w-1/3 ">
				<div className="flex flex-col items-center justify-center w-full h-1/2">
					<label className="m-2 text-center opacity-70">Currently</label>
					<label
						className={`text-2xl text-center 
            ${status === STATUS.working && " text-green"} 
            ${status === STATUS.late && " text-red"}
            ${status === STATUS.break && " text-yellow"}`}
					>
						{statusToTitle[status]}
					</label>
				</div>
				<div className="flex flex-col items-center justify-center w-full h-1/2">
					{status !== STATUS.break ? (
						<button
							className={`text-xl flex items-center justify-center h-10 m-1  rounded-md  w-36 hover:scale-105 
            ${status === STATUS.working ? " bg-red text-white" : " bg-green text-black"}`}
							onClick={handleClockIn}
						>
							{status === STATUS.working ? "Clock-Out" : "Clock-In"}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-6 h-6 ml-1"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</button>
					) : (
						<div className="h-10 m-1 w-28"></div>
					)}
					{status === STATUS.working || status === STATUS.break ? (
						<button
							className="h-10 m-1 text-xl text-black rounded-md w-36 hover:scale-105 bg-yellow"
							onClick={handleBreak}
						>
							{status === STATUS.break ? "End Break" : "Start Break"}
						</button>
					) : (
						<div className="h-10 m-1 w-28"></div>
					)}
				</div>
			</div>
			<div className="flex flex-col items-center justify-center w-full h-full px-5 sm:w-1/3 ">
				<div className="flex flex-col items-center justify-center w-full h-1/2">
					<label className="m-2 text-3xl text-center opacity-70">{date}</label>
					<label className="text-4xl text-center ">{time}</label>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center w-full h-full px-5 sm:w-1/3 ">
				<div className="flex flex-col items-center justify-center w-full h-1/2">
					<label className="m-2 text-center opacity-70">Today</label>
					<label className="text-2xl text-center text-green">{mSecondsDateToString(worked)}</label>
				</div>
				<div className="flex flex-col items-center justify-center w-full h-1/2">
					<label className="m-2 text-center opacity-70">Last 7 Days</label>
					<label className="text-2xl text-center text-green">
						{mSecondsDateToString(user.worked7)}
					</label>
				</div>
			</div>
		</div>
	);
};

export default DashboardUI;

function calculateWorked(day) {
	let worked = 0;
	if (!day) return worked;
	const now = new Date();
	for (let i = 0; i < day.clockedIn.length; i++) {
		if (day.clockedIn[i]) {
			const WorkStarted = new Date(day.clockedIn[i]);
			WorkStarted.setSeconds(0);
			if (day.clockedOut[i]) {
				const WorkEnded = new Date(day.clockedOut[i]);
				worked += WorkEnded - WorkStarted;
			} else {
				worked += now - WorkStarted;
			}
		}
	}
	return worked;
}

function mSecondsDateToString(milliseconds) {
	const date = new Date(milliseconds);
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const formattedHours = hours < 10 ? `0${hours}` : hours;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	const formattedTime = `${formattedHours}:${formattedMinutes}`;
	return formattedTime;
}
