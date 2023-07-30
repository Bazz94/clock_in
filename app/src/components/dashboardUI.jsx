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
    worked.current = calculateHrsWorked(currentDay);
    setTimeout(() => {
      worked.current = calculateHrsWorked(currentDay);
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
        clockedOut: {
          dates: date.toISOString()
        }
      });
      if (onBreak) {
        setOnBreak(false);
        currentDayDispatch({
          type: 'set',
          endedBreak: {
            dates: date.toISOString()
          }
        });
      }
    } else {
      setWorking(true);
      currentDayDispatch({
        type: 'set',
        clockedIn: {
          dates: date.toISOString()
        }
      });
    }
  }

  function handleBreak() {
    if (onBreak) {
      setOnBreak(false);
      currentDayDispatch({
        type: 'set',
        endedBreak: {
          dates: new Date()
        }
      });
    } else {
      setOnBreak(true);
      currentDayDispatch({
        type: 'set',
        startedBreak: {
          dates: new Date()
        }
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
            {worked.current ? dateToString(worked.current) : '00:00'}</p>
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
  const currentTime = 20;
  if (currentDay.workStarts.date && !currentDay.clockedIn.dates && currentTime > currentDay.workStarts.date) {
    // set day status to late
    return (currentDay.workStarts.date - currentTime) + ' Late';
  }
  if (currentDay.startedBreak.dates && !currentDay.endedBreak.dates) {
    return 'On break';
  }
  if (currentDay.clockedIn.dates && !currentDay.clockedOut.dates) {
    return 'Working';
  }
  if (currentDay.clockedIn.dates && currentDay.clockedOut.dates) {
    return 'Done working';
  }
  return 'None';
}


function calculateHrsWorked(currentDay) {
  if (!currentDay) return new Date('2023-07-28T00:00:00.000+02:00');
  const now = new Date();
  if (currentDay.clockedIn.dates) {
    const WorkStarted = new Date(currentDay.clockedIn.dates);
    WorkStarted.setSeconds(0);
    if (currentDay.clockedOut.dates) {
      const WorkEnded = new Date(currentDay.clockedOut.dates);
      return getDifferenceAsDate(WorkEnded, WorkStarted);
    } else {
      return getDifferenceAsDate(now, WorkStarted);
    }
  }
  return new Date('2023-07-28T00:00:00.000+02:00');
}

function getDifferenceAsDate(date1, date2) {
  const differenceInMilliseconds = Math.abs(date1 - date2);
  const differenceDate = new Date(differenceInMilliseconds - (1000 * 60 * 60 * 2));
  return differenceDate;
}

function dateToString(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedTime = `${formattedHours}:${formattedMinutes}`;
  return formattedTime;
}