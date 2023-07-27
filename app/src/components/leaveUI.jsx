import { useEffect, useState } from "react";
import Calendar from 'react-calendar';
import '../styles/calender.css'


const LeaveUI = ({ schedule, scheduleDispatch}) => {
  const [editEnabled, setEditEnabled] = useState(false);
  const [value, onChange] = useState();
  const [leaveDays, setLeaveDays] = useState([]);
  const [sickDays, setSickDays] = useState([]);

  useEffect(() => {
    console.log(schedule);
    setLeaveDays(schedule.scheduledLeave);
    setSickDays(schedule.scheduledSick);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (editEnabled === true) {
      // update schedule
      
    }
    setEditEnabled(!editEnabled);
  }
  return (
    <div className='flex flex-row flex-wrap sm:flex-1 min-h-[400px]'>
      <div className='flex-1 h-full m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
        <div className="flex flex-col items-center justify-center w-full h-full p-2">
          <h2 className='m-5 text-3xl'>
            Leave
          </h2>
          <div className='flex flex-col items-center justify-center flex-1' style={{color: "black"}}>
            {schedule && <Calendar 
              {...console.log(value)}
              onChange={(value) => editEnabled ? onChange(value) : false} 
              
              value={value}
              minDate={new Date()}
              tileClassName={({ activeStartDate, date, view }) => {
                if (view !== 'month') return null;
                if (leaveDays.find(day => new Date(day).toDateString() === date.toDateString())) {
                  return 'leave-day';
                }
                if (sickDays.find(day => new Date(day).toDateString() === date.toDateString())) {
                  return 'sick-day';
                }
                return null;
              }}
              onClickDay={(value, event) => {
                //console.log(value);
              }}
            />}
            <button className='w-24 p-2 mt-2 rounded-lg text-neutral-50 bg-neutral-600 text-md hover:scale-105'
              onClick={handleSubmit}
            >
              {editEnabled ? 'Ok' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaveUI;