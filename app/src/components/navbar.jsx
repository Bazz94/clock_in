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

  function clickSocial() {
    setCurrentTab('social');
    localStorage.setItem('tab', 'social');
  }

  return (
    <nav className='flex justify-center w-screen h-20 bg-black'>
      <div className='flex flex-1 max-w-6xl'>
        <div className='flex w-2/3'>
          <button className='p-4 text-xl text-left hover:-translate-y-[2px] hover:opacity-80 hover:text-green' 
            onClick={clickUsername}>
            {user.name}
          </button>
        </div>
        <div className='flex justify-end w-2/3'>
          <button className={`p-4 text-xl   hover:text-green
            ${currentTab === 'home' ? selected : 'hover:-translate-y-[2px] hover:opacity-80'}`}
            onClick={clickHome}>
            Home
          </button>
          <button className={`p-4 text-xl hover:text-green
            ${currentTab === 'schedule' ? selected : 'hover:-translate-y-[2px] hover:opacity-80'}`}
            onClick={clickSchedule}>
            Schedule
          </button>
          <button className={`p-4 text-xl hover:text-green
            ${currentTab === 'social' ? selected : 'hover:-translate-y-[2px] hover:opacity-80'}`}
            onClick={clickSocial}>
            Social
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar;

const selected = "text-green hover:text-green";