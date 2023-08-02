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
    <div className="h-screen bg-black">
      <SideDrawer openSideDrawer={openSideDrawer} setOpenSideDrawer={setOpenSideDrawer}/>
      {user && <NavBar 
        user={user} 
        openSideDrawer={openSideDrawer} 
        setOpenSideDrawer={setOpenSideDrawer}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />}
      {currentTab === 'home' && 
        <section className='flex flex-col items-center h-[calc(100vh-80px)] w-screen p-5 ' >
          <div className='w-5/6 p-2  h-1/3 max-w-7xl min-w-[350px] '>
            {user && <DashboardUI user={user} currentDay={currentDay} currentDayDispatch={currentDayDispatch}/>}
          </div>
          <div className='w-5/6 p-2  h-1/3 max-w-7xl min-w-[350px] '>
            {user && <Timeline day={currentDay}/>}
          </div>
          <div className='w-5/6 p-2  h-1/3 max-w-7xl min-w-[350px] '>
            {user && <Calendar user={user} />}
          </div>
        </section>}
      {currentTab === 'schedule' &&
        <section className='flex flex-col items-center h-[calc(100vh-80px)] w-screen p-5 ' >
          <div className='w-5/6 p-2  h-1/2 max-w-7xl min-w-[350px] '>

          </div>
          <div className='w-5/6 p-2  h-1/2 max-w-7xl min-w-[350px] '>

          </div>
        </section>}
      {currentTab === 'social' &&
        <section className='flex flex-col items-center h-[calc(100vh-80px)] w-screen p-5 ' >
          <div className='w-full p-2  h-full max-w-7xl min-w-[350px] '>

          </div>
        </section>}
      <Popup
        error={error}
        setError={setError}
        updateToken={updateToken}
      />
    </div>
  )
}




