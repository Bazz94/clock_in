import { useEffect, useState } from "react";
import TeamsPopup from "./teamPopup";


const TeamsUI = () => {
  const [error, setError] = useState();
  const [tab, setTab] = useState('none');

  function handleJoin() {
    setTab('team');
  } 

  function handleCreate() {
    setTab('create');
  }

  return (
    <div className="flex flex-col items-center h-full">
      <h2 className='flex items-center m-2 text-2xl h-28'>
        Teams 
      </h2>
      <div className="flex flex-col items-center flex-1 p-2">
        <input className="m-2 mb-0 text-center text-black w-42 h-7" type="text" placeholder="Enter team code..."/>
        <button className='w-16 p-2 m-2 mb-6 rounded-lg bg-red text-md hover:scale-105'>
          Join
        </button>
        <button className='w-16 p-2 mt-10 rounded-lg bg-red text-md hover:scale-105'>
          Create
        </button>
        <TeamsPopup error={error} setError={setError}/>
      </div>
    </div>
  )
}

export default TeamsUI;