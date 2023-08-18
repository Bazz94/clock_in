import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "../styles/calender.css";
import LeavePopup from "./LeavePopup";

const LeaveUI = ({ schedule, scheduleDispatch }) => {
	const [selectedDay, setSelectedDay] = useState();
	const [openPopup, setOpenPopup] = useState(false);
	const [isRemove, setIsRemove] = useState("add");

	return (
		<div className="flex flex-col relative justify-center items-center flex-1 h-full w-min-[366px]">
			<h2 className="flex items-center m-2 text-2xl h-1/6">Schedule Leave</h2>
			<div className="flex flex-col items-center justify-center w-full p-2">
				<div className="flex justify-center w-full m-2 row">
					<div className="flex flex-col m-2">
						<label className="mx-2 text-center opacity-70">Leave Days Left</label>
						<label className="text-2xl text-center text-blue">
							{schedule.annulLeave - schedule.leaveUsed}
						</label>
					</div>
					<div className="flex flex-col m-2">
						<label className="mx-2 text-center opacity-70">Sick Days Used</label>
						<label className="text-2xl text-center text-yellow">{schedule.sickUsed}</label>
					</div>
				</div>
				<div className="relative flex flex-col justify-center m-2 h-2/3">
					{schedule && (
						<Calendar
							onChange={(value, event) => {
								// Selected is a leave day
								if (schedule.scheduledLeave.find((day) => sameDay(day, value))) {
									setIsRemove(true);
									setOpenPopup(true);
									setSelectedDay(value);
									return false;
								}
								if (schedule.scheduledSick.find((day) => sameDay(day, value))) {
									setIsRemove(true);
									setOpenPopup(true);
									setSelectedDay(value);
									return false;
								}
								if (selectedDay && sameDay(selectedDay, value)) {
									setSelectedDay(null);
									return false;
								}
								setIsRemove(false);
								setOpenPopup(true);
								setSelectedDay(value);
							}}
							value={selectedDay}
							minDate={new Date()}
							tileClassName={({ activeStartDate, date, view }) => {
								if (view !== "month") return null;
								let today = new Date();
								today = today.toDateString();
								if (sameDay(date, today)) return null;
								if (schedule.scheduledLeave.find((day) => sameDay(day, date))) {
									return "leave-day";
								}
								if (schedule.scheduledSick.find((day) => sameDay(day, date))) {
									return "sick-day";
								}
								if (sameDay(selectedDay, date)) {
									return "selected-day";
								}
								return null;
							}}
						/>
					)}
					<label className="m-4 text-sm text-center opacity-70">
						*Select a date to schedule leave
					</label>
				</div>
			</div>
			<LeavePopup
				openPopup={openPopup}
				setOpenPopup={setOpenPopup}
				selectedDay={selectedDay}
				setSelectedDay={setSelectedDay}
				schedule={schedule}
				scheduleDispatch={scheduleDispatch}
				isRemove={isRemove}
			/>
		</div>
	);
};

export default LeaveUI;

function sameDay(date1, date2) {
	const newDate1 = new Date(date1);
	const newDate2 = new Date(date2);
	const result = newDate1.toDateString().slice(0, 10) === newDate2.toDateString().slice(0, 10);
	return result;
}
