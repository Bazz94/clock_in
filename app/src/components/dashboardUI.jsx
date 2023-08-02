import { useEffect, useContext, useState, useRef } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';
import config from '../config/config.js';


const DashboardUI = ({ user, currentDay, currentDayDispatch }) => {
  const [currentEvent, setCurrentEvent] = useState('');
  const [clockInButtonText, setClockInButton] = useState('Clock-in');
  const [breakStartButtonText, setBreakStartButtonText] = useState('Start break');
  const [working, setWorking] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [worked, setWorked] = useState(0);
  console.log('worked: ', worked)
  useEffect(() => {
    setWorked(calculateWorked(currentDay));
    const now = new Date();
    setTimeout(() => {
      setWorked(calculateWorked(currentDay));
      setInterval(() => {
        console.log('tick');
        setWorked(calculateWorked(currentDay));
      },1000 * 60);
    }, (60 - now.getSeconds()) * 1000);
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