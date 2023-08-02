import Clock from '../components/clock.jsx';

function NavBar({ user, openSideDrawer, setOpenSideDrawer, currentTab, setCurrentTab }) {

  function clickUsername() {
    setTimeout(() => {
      setOpenSideDrawer(!openSideDrawer);
    },0);
  }

  function clickHome() {
    setCurrentTab('home');
    localStorage.setItem('tab', 'home');
  }

  function clickSchedule() {
    setCurrentTab('schedule');
    localStorage.setItem('tab', 'schedule');
  }

  function clickLeave() {
    setCurrentTab('leave');
    localStorage.setItem('tab', 'leave');
  }

  return (
    <nav className='flex justify-center w-screen h-20 bg-black'>
      <div className='flex flex-1 max-w-7xl'>
        <button className='w-1/3 p-5 pl-12 text-xl text-left hover:scale-105 '
          onClick={clickUsername}>
          {user.name}
        </button>
        <div className='flex flex-row content-center justify-center w-1/3'>
          <button className={`w-1/3 text-xl hover:scale-105
            ${currentTab === 'home' ? selected : ''}`}
            onClick={clickHome}>
            Home
          </button>
          <button className={`w-1/3 text-xl hover:scale-105 
            ${currentTab === 'schedule' ? selected : ''}`}
            onClick={clickSchedule}>
            Schedule
          </button>
          <button className={`w-1/3 text-xl hover:scale-105 
            ${currentTab === 'leave' ? selected : ''}`}
            onClick={clickLeave}>
            Leave
          </button>
        </div>
        <div className='w-1/3'>
          <Clock />
        </div>
      </div>
    </nav>
  )
}

export default NavBar;

const selected = "underline text-orange-400";