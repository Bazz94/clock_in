import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Loading from '../components/loading.jsx';
import { MyContext } from '../contexts/MyContextProvider.jsx';
import SideDrawer from '../components/sideDrawer.jsx';
import NavBar from '../components/navbar.jsx';
import Timeline from '../components/timeline.jsx';
import Status from '../components/status.jsx';
import Stats from '../components/stats.jsx';
import Calendar from '../components/calander.jsx';

const userData = {
  user_id: '123456789',
  name: 'Cakemix',
  email: 'email@gmail.com',
  startedDate: '2023-07-01',
  worked7: 38,
  worked7goal: 45,
  streak: 68,
  consistency: 98,
  sickUsed: 3,
  leaveLeft: 21, 
}

const days = [
  {
    day_id: '2023-07-12',
    date: '2023-07-12',
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
  const [date, setDate] = useState(null);

  useEffect(() => {
    // Get data from api
    const date = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-UK', options);
    setDate(formattedDate);
  }, []);

  return isLoading ? (<Loading />) : (
    <div className="flex flex-col h-screen">
      <SideDrawer openSideDrawer={openSideDrawer} setOpenSideDrawer={setOpenSideDrawer}/>
      <NavBar userData={userData} openSideDrawer={openSideDrawer} setOpenSideDrawer={setOpenSideDrawer}/>
      <section className='flex flex-col items-center justify-center flex-1 w-screen' >
        <div className='flex flex-row justify-center w-full h-full p-5 lg:p-10 lg:w-5/6 max-w-7xl min-w-[16rem]'>
          <div className='flex flex-col hidden w-1/2 md:w-1/3 sm:block'>
            <div className='flex items-center justify-center h-16'>
              <h1 className='text-xl'>{date}</h1>
            </div>
            <div className='flex items-center justify-center mx-4 h-5/6'>
              <Timeline/>
            </div>
          </div>
          <div className='w-full sm:w-1/2 md:w-2/3 min-w-[16rem]'>
            <div className='flex items-center justify-center h-16 pr-6 ml-6'>
              <h1 className='text-xl'>Welcome</h1>
            </div>
            <div className='flex flex-col flex-wrap flex-1 lg:flex-row '>
              <div className='flex-1 m-4 mt-0 border border-gray-400 rounded-xl'>
                <Status/>
              </div>
              <div className='flex-1 m-4 mt-0 border border-gray-400 rounded-xl'>
                <Stats/>
              </div>
            </div>
            <div className='hidden m-4 mb-0 border border-gray-400 rounded-xl h-1/3 lg:block'>
              <Calendar days={days}/>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

