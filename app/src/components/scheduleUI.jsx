import { useEffect, useRef, useState } from "react";

const ScheduleUI = ({ schedule, scheduleDispatch }) => {
  const [editEnabled, setEditEnabled] = useState(false);
  const [workStartsError, setWorkStartsError] = useState(false);
  const [workEndsError, setWorkEndsError] = useState(false);
  const [daysToWork, setDaysToWork] = useState([]);
  const [workStarts, setWorkStarts] = useState('08:00');
  const [workEnds, setWorkEnds] = useState('17:00');
  let estimateHr = useRef(0);
  if (workEnds) {
    estimateHr.current = (daysToWork.length * (getTimeInMinutes(workEnds) - getTimeInMinutes(workStarts) - 60))/60;
  }

  useEffect(() => {
    if (schedule.workStarts) {
      const date = new Date(schedule.workStarts);
      setWorkStarts(dateToString(date));
    }
    if (schedule.workEnds) {
      const date = new Date(schedule.workEnds);
      setWorkEnds(dateToString(date));
    }
    if (schedule.workdays.length > 0) {
      setDaysToWork(schedule.workdays);
    }
  },[])

  function handleSubmit(e) {
    e.preventDefault();
    if (editEnabled === true) {
      scheduleDispatch({
        type: 'set',
        workStarts: stringToDate(workStarts),
        workEnds: stringToDate(workEnds),
        workdays: daysToWork,
      });
    }
    setEditEnabled(!editEnabled);
  }

  function changeWorkStart(e) {
    const value = e.target.value;
    if (workEnds <= value) {
      setWorkStartsError(true);
      setTimeout(() => setWorkStartsError(false),3000);
      return false;
    }
    setWorkStartsError(false);
    setWorkStarts(value);
    
  }

  function changeWorkEnd(e) {
    const value = e.target.value;
    if (value <= workStarts) {
      setWorkEndsError(true);
      setTimeout(() => setWorkEndsError(false), 3000);
      return false;
    }
    setWorkEndsError(false);
    setWorkEnds(e.target.value);
  }

  return (
    <form className="flex flex-col items-center justify-center w-full h-full p-2"
      onSubmit={handleSubmit}>
        <h2 className='m-2 text-2xl'>
          Set Schedule
        </h2>
        <div className='flex flex-col items-center justify-center flex-1'>
          <div className="flex m-2 h-7 w-[366px]">
            <label className="w-32">Days to work: </label>
            <WeekPicker editEnabled={editEnabled} daysToWork={daysToWork} setDaysToWork={setDaysToWork}/>
          </div>
        <div className="h-7 flex m-2 w-[366px]">
            <label className="w-32">Work starts: </label>
          {editEnabled ? <input className={`h-7 flex tracking-wider text-black focus:outline-none ${workStartsError ? "focus:border-2 focus:border-red-400" : ''}`}
              type="time"
              value={workStarts}
              onChange={changeWorkStart}
            /> : <label className="w-32">{workStarts} </label>}
          </div>
        <div className=" h-7 flex m-2  w-[366px]">
            <label className="w-32">Work ends: </label>
          {editEnabled ? <input className={`h-7 flex tracking-wider text-black focus:outline-none${workEndsError ? "border-2 border-red-400" : ''}`}
                type="time"
                value={workEnds}
                onChange={changeWorkEnd}
            /> : <label className="w-32">{workEnds} </label>}
          </div>
          <div className="flex flex-col m-2 justify-center items-center w-[366px]">
            <p className="">{estimateHr.current} hours per week</p>
            <p className="text-sm opacity-70">*includes 1 hr lunch per day</p>
          </div>
          <button className='w-16 p-2 mt-4 rounded-lg bg-red text-md hover:scale-105' type="submit">
          {editEnabled ? 'Ok' : 'Edit'}
          </button>
        </div>
    </form>
  )
} 

export default ScheduleUI;


const WeekPicker = ({ editEnabled, daysToWork, setDaysToWork }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S',];
  return (
    <div className="flex">
      {days.map((day, index) => {
        return (
          <button 
            key={index}
            className={`flex justify-center w-6 px-3 mx-1 align-middle rounded-full cursor-default 
              ${daysToWork.find(item => item === index) != null ? "bg-green text-grey" : "bg-grey"} 
              ${editEnabled ? "hover:scale-105 cursor-pointer" : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if (!editEnabled) return false;
              daysToWork.find(day => day === index) != null
                ? setDaysToWork(daysToWork.filter(item => item !== index))
                : setDaysToWork([...daysToWork, index]);
            }}
          >
            {day}
          </button>
        )
      })}
      
    </div>
  )
}


function getTimeInMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

// String in format "17:00"
function stringToDate(string) {
  const currentDate = new Date();
  const [hours, minutes] = string.split(":").map(Number);
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hours,
    minutes
  );
}

function dateToString(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedTime = `${formattedHours}:${formattedMinutes}`;
  return formattedTime;
}