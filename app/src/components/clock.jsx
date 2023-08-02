import { useContext } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';

function Clock() {
  const { time} = useContext(MyContext);

  return (
    <span className='flex items-center justify-end w-full h-full p-5 pr-12 text-xl'>
      {time}
    </span>
  )
}

export default Clock;

