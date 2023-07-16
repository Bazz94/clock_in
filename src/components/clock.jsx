import { useContext } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';

function Clock() {
  const { time} = useContext(MyContext);

  return (
    <span className='flex items-center justify-center w-full h-full p-5 text-xl'>
      {time}
    </span>
  )
}

export default Clock;

