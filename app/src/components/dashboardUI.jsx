import { useEffect, useContext, useState, useRef } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';
import config from '../config/config.js';


const DashboardUI = ({ user, currentDay, currentDayDispatch }) => {
  const { time } = useContext(MyContext);
  const [date, setDate] = useState(null);
  const [currentEvent, setCurrentEvent] = useState('');
  const [clockInButtonText, setClockInButton] = useState('Clock-in');
  const [breakStartButtonText, setBreakStartButtonText] = useState('Start break');
  const [working, setWorking] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [worked, setWorked] = useState(0);

  useEffect(() => {
    const date = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-UK', options);
    setDate(formattedDate);
    setWorked(calculateWorked(currentDay));
    const now = new Date();
    setTimeout(() => {
      setWorked(calculateWorked(currentDay));
      setInterval(() => {
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
      setBreakStartButtonText('End Break');
    } else {
      setBreakStartButtonText('Start Break')
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
    <div className='flex flex-col min-w-[350px] w-full sm:flex-row sm:h-full'>
      <div className="flex flex-col items-center justify-center w-full h-full px-5 sm:w-1/3 ">
        <div className="flex flex-col items-center justify-center w-full h-1/2">
          <label className="m-2 text-center opacity-70">Currently</label>
          <label className={`text-2xl text-center 
            ${working && ' text-green'} 
            ${currentEvent === 'Late' && ' text-red'}`}>
            {currentEvent}
          </label>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-1/2">
          <button className={`text-xl flex items-center justify-center h-10 m-1  rounded-md  w-36 hover:scale-105 
            ${working ? ' bg-red text-white' : ' bg-green text-black'}`}
            onClick={handleClockIn}>
            {clockInButtonText}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {working 
            ? <button className="h-10 m-1 text-xl text-black rounded-md w-36 hover:scale-105 bg-yellow" 
                onClick={handleBreak}>
                {breakStartButtonText }
              </button> 
            : <div className="h-10 m-1 w-28"></div>}
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
          <label className="text-2xl text-center text-green">{mSecondsDateToString(user.worked7)}</label>
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