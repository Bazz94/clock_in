import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Loading from '../components/loading.jsx';
import { MyContext } from '../contexts/MyContextProvider.jsx';
import SideDrawer from '../components/sideDrawer.jsx';
import NavBar from '../components/navbar.jsx';
import Timeline from '../components/timeline.jsx';
import DashboardUI from '../components/dashboardUI.jsx';
import Calendar from '../components/calender.jsx';
import ScheduleUI from '../components/scheduleUI.jsx';
import LeaveUI from '../components/leaveUI.jsx';
import Popup from '../components/popup.jsx';
import useUserReducer from '../reducers/useUserReducer.jsx';
import useCurrentDayReducer from '../reducers/useCurrentDayReducer.jsx';
import useScheduleReducer from '../reducers/useScheduleReducer.jsx';
import { updateDB, getUserFromDB } from '../fetch/serverRequests.jsx';


export default function Home() {
  const navigate = useNavigate();
  const { token, updateToken } = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false); // {message: 'error', redirect: false}
  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const [date, setDate] = useState(null);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tab') ? localStorage.getItem('tab') : 'home');
  const [user, userDispatch] = useUserReducer();
  const [currentDay, currentDayDispatch] = useCurrentDayReducer();
  const [schedule, scheduleDispatch] = useScheduleReducer();
  
  
  useEffect(() => {
    console.log('token:',token.slice(0, 20));
    if (!token) {
      navigate("/login");
      return () => {};
    }

    const date = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-UK', options);
    setDate(formattedDate);

    // Get user data
    setIsLoading(true);
    getUserFromDB(token, 'user').then(data => {
      userDispatch({
        type: 'init',
        user: data
      });
      currentDayDispatch({
        type: 'init',
        currentDay: data.currentDay
      });
      scheduleDispatch({
        type: 'init',
        schedule: data.schedule
      });
      
    }).catch(err => {
      setError({message: err.message, redirect: true});
    }).finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentDay) {
      return () => {};
    }
    updateDB(token, 'currentDay',currentDay).then((value) => {
      console.log(value);
    });
  }, [currentDay]);

  useEffect(() => {
    if (!schedule) {
      return () => {};
    }
    updateDB(token, 'schedule', schedule).then((value) => {
      console.log(value);
    });
  }, [schedule]);

  
  return isLoading ? (<Loading />) : (
    <div className="flex flex-col h-screen">
      <SideDrawer openSideDrawer={openSideDrawer} setOpenSideDrawer={setOpenSideDrawer}/>
      {user && <NavBar 
        user={user} 
        openSideDrawer={openSideDrawer} 
        setOpenSideDrawer={setOpenSideDrawer}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />}
      <section className='flex flex-col items-center justify-center h-[90%] w-screen' >
        <div className='flex flex-row justify-center w-full h-full p-0 sm:p-5 md:w-5/6 lg:w-full xl:w-5/6 max-w-7xl min-w-[16rem]'>
          <div className='flex-col hidden w-1/3 lg:flex'>
            <div className='flex items-center justify-center h-16'>
              <h1 className='text-xl'>{date}</h1>
            </div>
            <div className='flex items-center justify-center flex-1 mx-4 border shadow-md border-neutral-800 rounded-xl'>
              {user && <Timeline day={currentDay}/>}
            </div>
          </div>
          <div className='flex flex-col w-full lg:w-2/3 min-w-[16rem] justify-center'>
            <div className='flex items-center justify-center h-16 pr-6 ml-6'>
              <h1 className='text-xl'>Welcome</h1>
            </div>
            {user && (currentTab === 'home' 
              ? <DashboardUI user={user} currentDay={currentDay} currentDayDispatch={currentDayDispatch} />  
              : currentTab === 'schedule'
                ? <ScheduleUI schedule={schedule} scheduleDispatch={scheduleDispatch}/> 
                : <LeaveUI schedule={schedule} scheduleDispatch={scheduleDispatch} />)
            }
            <div className='m-2 mb-2 border shadow-md sm:m-4 sm:mb-0 sm:h-1/3 border-neutral-800 rounded-xl h-fit'>
              {user && <Calendar user={user} />}
            </div>
          </div>
        </div>
      </section>
      <Popup
        error={error}
        setError={setError}
        updateToken={updateToken}
      />
    </div>
  )
}





