import { useEffect, useState } from "react";
import Calendar from 'react-calendar';
import '../styles/calender.css'
import LeavePopup from "./LeavePopup";


const LeaveUI = ({ schedule, scheduleDispatch}) => {
  const [selectedDay, setSelectedDay] = useState();
  const [openPopup, setOpenPopup] = useState(false);
  const [isRemove, setIsRemove] = useState('add');

  return (
    <div className='relative flex flex-row flex-wrap sm:flex-1 min-h-[400px]'>
      <div className='flex-1 h-full m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
        <div className="flex flex-col items-center justify-center w-full h-full p-2">
          <div className="flex">
            <span className="m-5">Sicked Days Used: {schedule.sickUsed}</span>
            <span className="m-5">Leave remaining: {schedule.annulLeave - schedule.leaveUsed}</span>
          </div>
          <div className='relative flex flex-col items-center justify-center flex-1' style={{color: "black"}}>
            {schedule && <Calendar 
              onChange={(value, event) => {
                // Selected is a leave day
                if (schedule.scheduledLeave.find(day => sameDay(day, value))) {
                  setIsRemove(true);
                  setOpenPopup(true);
                  setSelectedDay(value);
                  return false;
                }
                if (schedule.scheduledSick.find(day => sameDay(day, value))) {
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
                if (view !== 'month') return null;
                let today = new Date();
                today = today.toDateString();
                if (sameDay(date, today)) return null;
                if (schedule.scheduledLeave.find(day => sameDay(day, date))) {
                  return 'leave-day';
                }
                if (schedule.scheduledSick.find(day => sameDay(day, date))) {
                  return 'sick-day';
                }
                if (sameDay(selectedDay, date)) {
                  return 'selected-day';
                }
                return null;
              }}
            />}
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
    </div>
  )
}

export default LeaveUI;


function sameDay(date1, date2) {
  const newDate1 = new Date(date1);
  const newDate2 = new Date(date2);
  const result = newDate1.toDateString().slice(0, 10) === newDate2.toDateString().slice(0, 10);
  return result;
}