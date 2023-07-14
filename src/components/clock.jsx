import { useEffect, useState } from "react";

function Clock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(getTime());
    setInterval(() => {
      setTime(getTime());
    }, 60 * 1000);
  },[]);

  return (
    <span className='flex items-center justify-center w-full h-full p-5 text-xl'>
      {time}
    </span>
  )
}

function getTime() {
  const date = new Date();
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return formattedTime;
}

export default Clock;

