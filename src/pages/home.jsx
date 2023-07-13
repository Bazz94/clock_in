import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Loading from '../components/loading.jsx';
import { MyContext } from '../contexts/MyContextProvider.jsx';
import SideDrawer from '../components/sideDrawer.jsx';

const userData = {
  user_id: '123456789',
  name: 'Cakemix',
  email: 'email@gmail.com',
  worked7: 38,
  worked7goal: 45,
  streak: 68,
  consistency: 98,
  sickUsed: 3,
  leaveLeft: 21, 
}

const days = [
  {
    day_id: '20230712',
    date: '20230712',
    status: 'current',
    worked: 0,
    events: [
      {
        event_id: '1',
        timeStamp: 'timeStamp',
        type: 'startWork',
      },
      {
        event_id: '2',
        timeStamp: 'timeStamp',
        type: 'endWork',
      },
    ]
  }
]

export default function Home() {
  const { user_id, updateUser_id } = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [openSideDrawer, setOpenSideDrawer] = useState(false);

  useEffect(() => {
    // Get data from api
  }, []);

  function clickUsername() {
    setTimeout(() => {
      setOpenSideDrawer(true);
    },0)
    // Open side drawer
    // reset button
    // logout button
  }

  function clickHome() {
    // do nothing 
  }

  function clickSchedule() {
    // Change ui 
  }

  function clickLeave() {
    // Change ui
  }

  return isLoading ? (<Loading />) : (
    <div className="flex flex-col h-screen">
      <SideDrawer openSideDrawer={openSideDrawer} setOpenSideDrawer={setOpenSideDrawer}/>
      <nav className='flex content-center w-screen h-20 bg-neutral-800'>
        <button className='p-5 mx-40 text-xl hover:scale-105 focus:text-orange-400'
          onClick={clickUsername}>
          {userData.name}
        </button>
        <button className='p-5 text-xl hover:scale-105 focus:underline focus:text-orange-400'
          onClick={clickHome}>
          Home
        </button>
        <button className='p-5 text-xl hover:scale-105 focus:underline focus:text-orange-400'
          onClick={clickSchedule}>
          Schedule
        </button>
        <button className='p-5 text-xl hover:scale-105 focus:underline focus:text-orange-400'
          onClick={clickLeave}>
          Leave
        </button>
      </nav>
      <section className='flex-1' >
        <div className='flex flex-col max-2xl:'>
          
        </div>
      </section>
    </div>
  )
}