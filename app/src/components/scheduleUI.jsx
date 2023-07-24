import { useEffect, useRef, useState } from "react";

const ScheduleUI = ({user}) => {
  const [editEnabled, setEditEnabled] = useState(false);
  const [workStartsError, setWorkStartsError] = useState(false);
  const [workEndsError, setWorkEndsError] = useState(false);
  const [daysToWork, setDaysToWork] = useState([1,2,3,4,5]);
  const [workStarts, setWorkStarts] = useState('08:00');
  const [workEnds, setWorkEnds] = useState('17:00');
  let estimateHr = useRef(0);
  estimateHr = (daysToWork.length * (getTimeInMinutes(workEnds) - getTimeInMinutes(workStarts) - 60))/60;

  useEffect(() => {
    console.log(user.schedule.workStarts);
    if (user.schedule.workStarts) {
      setWorkStarts(user.schedule.workStarts[10,5]);
    }
    if (user.schedule.workEnds) {
      setWorkEnds(user.schedule.workEnds[10, 5]);
    }
    if (user.schedule.workdays.length > 0) {
      setDaysToWork(user.schedule.workdays);
    }
  },[])

  function handleSubmit(e) {
    e.preventDefault();
    if (editEnabled === true) {
      // update database
      // update user
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
    <div className='flex flex-row flex-wrap sm:flex-1 min-h-[400px]'>
      <div className='flex-1 h-full m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
        <form className="flex flex-col items-center justify-center w-full h-full p-2"
          onSubmit={handleSubmit}>
            <h2 className='m-5 text-3xl'>
              Schedule
            </h2>
            <div className='flex flex-col items-center justify-center flex-1'>
              <div className="flex m-3 w-[366px]">
                <label className="w-32">Days to work: </label>
                <WeekPicker editEnabled={editEnabled} daysToWork={daysToWork} setDaysToWork={setDaysToWork}/>
              </div>
              <div className="flex m-3 w-[366px]">
                <label className="w-32">Work starts: </label>
                {editEnabled ?<input className={`flex tracking-wider text-black hover:scale-105 focus:outline-none ${workStartsError ? "focus:border-2 focus:border-red-400" : ''}`}
                  type="time"
                  value={workStarts}
                  onChange={changeWorkStart}
                /> : <label className="w-32">{workStarts} </label>}
              </div>
              <div className="flex m-3  w-[366px]">
                <label className="w-32">Work ends: </label>
                {editEnabled ? <input className={`flex tracking-wider text-black hover:scale-105 focus:outline-none${workEndsError ? "border-2 border-red-400" : ''}`}
                    type="time"
                    value={workEnds}
                    onChange={changeWorkEnd}
                /> : <label className="w-32">{workEnds} </label>}
              </div>
              <div className="flex flex-col m-6 justify-center items-center w-[366px]">
                <p className="">{estimateHr} hours per week</p>
                <p className="text-sm">*includes 1 hr lunch per day</p>
              </div>
              <button className='w-16 p-2 mt-2 rounded-lg bg-neutral-600 text-md hover:scale-105' type="submit">
              {editEnabled ? 'Ok' : 'Edit'}
              </button>
            </div>
        </form>
      </div>
    </div>
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
            className={`flex justify-center w-6 px-3 mx-1 align-middle rounded-full cursor-default border border-neutral-500
              ${daysToWork.find(item => item === index) != null ? "bg-neutral-500" : "border"} 
              ${editEnabled ? "hover:scale-105 cursor-pointer" : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if (!editEnabled) return false;
              console.log('clicked', daysToWork.find(item => item === index) != null);
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