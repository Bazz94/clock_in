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
import config from '../config/config.js';
import Popup from '../components/popup.jsx';


export default function Home() {
  const { token, updateToken } = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const [date, setDate] = useState(null);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tab') ? localStorage.getItem('tab') : 'home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log(token);
    if(!token) {
      navigate("/login");
      return () => {};
    }

    const date = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-UK', options);
    setDate(formattedDate);

    // get user info
    const requestOptions = {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${token}`,
      }
    };
    setIsLoading(true);
    fetch(`${config.apiUrl}/user`, requestOptions)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 500) {
          throw Error('Server error');
        }
        throw Error('Failed to connect to server');
      }).then((data) => {
        // Login and navigate to Home page
        setUser(data.user);
        setIsLoading(false);
        navigate("/home");
      }).catch((err) => {
        setIsLoading(false);
        setRedirect(true);
        setErrorMessage(err.message);
        setOpenErrorDialog(true);
        return false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {user && <Timeline day={user.currentDay}/>}
            </div>
          </div>
          <div className='flex flex-col w-full lg:w-2/3 min-w-[16rem] justify-center'>
            <div className='flex items-center justify-center h-16 pr-6 ml-6'>
              <h1 className='text-xl'>Welcome</h1>
            </div>
            {currentTab === 'home' 
              ? <DashboardUI/>  
              : currentTab === 'schedule'
                ? <ScheduleUI/> 
                : <LeaveUI/>
            }
            <div className='m-2 mb-2 border shadow-md sm:m-4 sm:mb-0 sm:h-1/3 border-neutral-800 rounded-xl h-fit'>
              {user && <Calendar user={user} />}
            </div>
          </div>
        </div>
      </section>
      <Popup
        openErrorDialog={openErrorDialog}
        setOpenErrorDialog={setOpenErrorDialog}
        errorMessage={errorMessage}
        redirect={redirect}
        updateToken={updateToken}
      />
    </div>
  )
}




