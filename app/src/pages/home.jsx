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

const userData = {
  _id: '123456789',
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

function makeDate(offset = 0, hours = 0, mins = 0) {
  const date = new Date();
  if (hours !== null) {
    date.setHours(hours);
    date.setMinutes(mins);
  }
  date.setDate(date.getDate() - offset);
  return date;
}

const days = [
  {
    status: 'current',
    date: makeDate(0, null),
    worked: 0,
    workStarts: {
      date: makeDate(0,9)
      //dates: null
    },
    workEnds: {
      date: makeDate(0,20)
      //dates: null
    },
    clockedIn: {
      dates: makeDate(0,9) // turn into arrays, so users can clockIn multiple times
      //dates: null
    },
    clockedOut: {
      dates: makeDate(0,20) // turn into arrays, so users can clockOut multiple times
      //dates: null
    },
    startedBreak: {
      dates: null
    },
    endedBreak: {
      dates: null
    },
  },
  {
    status: 'perfect',
    date: makeDate(1, null),
  },
  {
    status: 'late',
    date: makeDate(2, null),
  }
]

export default function Home() {
  const { token, updateToken } = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const [date, setDate] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
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
    // eslint-disable-next-line no-undef
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
        updateToken(null);
        setErrorMessage(err.message);
        setOpenErrorDialog(true);
        return false;
      });
  }, []);

  return isLoading ? (<Loading />) : (
    <div className="flex flex-col h-screen">
      <SideDrawer openSideDrawer={openSideDrawer} setOpenSideDrawer={setOpenSideDrawer}/>
      <NavBar 
        userData={userData} 
        openSideDrawer={openSideDrawer} 
        setOpenSideDrawer={setOpenSideDrawer}
        setCurrentTab={setCurrentTab}
      />
      <section className='flex flex-col items-center justify-center h-[90%] w-screen' >
        <div className='flex flex-row justify-center w-full h-full p-0 sm:p-5 md:w-5/6 lg:w-full xl:w-5/6 max-w-7xl min-w-[16rem]'>
          <div className='flex-col hidden w-1/3 lg:flex'>
            <div className='flex items-center justify-center h-16'>
              <h1 className='text-xl'>{date}</h1>
            </div>
            <div className='flex items-center justify-center flex-1 mx-4 border shadow-md border-neutral-800 rounded-xl'>
              <Timeline day={days[0]}/>
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
              <Calendar days={days}/>
            </div>
          </div>
        </div>
      </section>
      <Popup
        openErrorDialog={openErrorDialog}
        setOpenErrorDialog={setOpenErrorDialog}
        errorMessage={errorMessage}
        redirect={redirect}
      />
    </div>
  )
}




