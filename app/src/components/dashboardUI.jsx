import { useEffect, useContext, useState, useRef } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';
import config from '../config/config.js';


const DashboardUI = ({ user, currentDay, currentDayDispatch }) => {
  const [currentEvent, setCurrentEvent] = useState('');
  const [clockInButtonText, setClockInButton] = useState('Clock-in');
  const [breakStartButtonText, setBreakStartButtonText] = useState('Start break');
  const [working, setWorking] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  let worked = useRef(0);

  useEffect(() => {
    worked.current = calculateWorked(currentDay);
    setTimeout(() => {
      console.log('tick');
      worked.current = calculateWorked(currentDay);
    },1000 * 60);
  }, []);

  useEffect(() => {
    if (currentEvent === 'Working' || currentEvent === 'On break') {
      setClockInButton('Clock-out');
    } else {
      setClockInButton('Clock-in')
    }
    if (currentEvent === 'On break') {
      setBreakStartButtonText('End break');
    } else {
      setBreakStartButtonText('Start break')
    }
    setWorking(currentEvent === 'Working');
  }, [currentEvent, currentDay]);

  useEffect(() => {
    setCurrentEvent(calculateCurrentEvent(currentDay));
  }, [currentDay, working, onBreak]);
  

  function handleClockIn() {
    const date = new Date();
    if (working) {
      setWorking(false);
      currentDayDispatch({
        type: 'set',
        clockedOut: [...currentDay.clockedOut, date.toISOString()]
      });
      if (onBreak) {
        setOnBreak(false);
        currentDayDispatch({
          type: 'set',
          endedBreak: [...currentDay.endedBreak, date.toISOString()]
        });
      }
    } else {
      setWorking(true);
      currentDayDispatch({
        type: 'set',
        clockedIn: [...currentDay.clockedIn, date.toISOString()]
      });
    }
  }


  function handleBreak() {
    const date = new Date();
    if (onBreak) {
      setOnBreak(false);
      currentDayDispatch({
        type: 'set',
        endedBreak: [...currentDay.endedBreak, date.toISOString()]
      });
    } else {
      setOnBreak(true);
      currentDayDispatch({
        type: 'set',
        startedBreak: [...currentDay.startedBreak, date.toISOString()]
      });
    }
  }

  
  return (
    <div className='flex flex-row flex-wrap sm:flex-1 min-h-[400px]'>
      <div className='flex-1 m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
        <div className="flex flex-col items-center justify-center w-full h-full p-2">
          <p className="p-3 text-lg">
            Current Event</p>
          <p className="pb-8 text-2xl">
            {currentEvent && currentEvent}</p>
          <button className="p-2 m-1 rounded-3xl w-28 hover:scale-105 bg-neutral-500" 
            onClick={handleClockIn}
          >
            {clockInButtonText}
          </button>
          {working && <button className="p-2 m-1 rounded-3xl w-28 hover:scale-105 bg-neutral-500"
            onClick={handleBreak}
          >
            {breakStartButtonText}
          </button>}
        </div>
      </div>
      <div className='flex-1 m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
        <div className="flex flex-col items-center justify-center w-full h-full p-2">
          <p className="p-1 text-lg">
            Work day</p>
          <p className="pb-4 text-2xl">
            {worked.current ? mSecondsDateToString(worked.current) : '00:00'}</p>
          <p className="pb-1 text-lg">
            Work Week</p>
          <p className="pb-4 text-2xl">
            {user.worked7}</p>
          <p className="pb-1 text-lg">
            Perfect Streak</p>
          <p className="pb-4 text-2xl">
            {user.streak}</p>
          <p className="pb-1 text-lg">
            Consistency</p>
          <p className="pb-2 text-2xl">
            {user.consistency}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardUI;


function calculateCurrentEvent(currentDay) {
  let result = 'None';
  const currentTime = 20;
  if (currentDay.workStarts[0] && !currentDay.clockedIn[0] && currentTime > currentDay.workStarts[0]) {
    // set day status to late
    return (currentDay.workStarts[0] - currentTime) + ' Late';
  }

  for (let i = 0; i < currentDay.clockedIn.length; i++) {
    if (currentDay.startedBreak[i] && !currentDay.endedBreak[i]) {
      return 'On break';
    }
    if (currentDay.clockedIn[i] && !currentDay.clockedOut[i]) {
      return 'Working';
    }
    if (currentDay.clockedIn[i] && currentDay.clockedOut[i]) {
      result = 'Done working';
    }
  }
  return result;
}


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
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedTime = `${formattedHours}:${formattedMinutes}`;
  return formattedTime;
}