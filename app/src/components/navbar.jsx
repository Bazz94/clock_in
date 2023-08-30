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
    setCurrentTab('teams');
    localStorage.setItem('tab', 'teams');
  }

  return (
    <nav className='flex justify-center h-20 bg-black min-w-[350px] max-w-7xl w-screen p-5'>
        <div className='flex w-2/3'>
        <button className='px-5 text-xl text-left border rounded-md group hover:bg-grey hover:bg-opacity-50 hover:text-green border-grey' 
            onClick={clickUsername}>
          <p className='group-hover:-translate-y-[2px]'>{user.name}</p>
          </button>
        </div>
        <div className='flex justify-end w-2/3'>
        <button className={`group px-3 mx-2 text-xl hover:text-green border
            ${currentTab === 'home' ? selected : ' hover:bg-grey hover:bg-opacity-50 border-grey'}`}
            onClick={clickHome}>
          <p className={currentTab !== 'home' ? 'group-hover:-translate-y-[2px]' : ''}>Home</p>
          </button>
        <button className={`group px-3 mx-2 text-xl hover:text-green border
            ${currentTab === 'schedule' ? selected : ' hover:bg-grey hover:bg-opacity-50 border-grey'}`}
            onClick={clickSchedule}>
          <p className={currentTab !== 'schedule' ? 'group-hover:-translate-y-[2px]' : ''}>Schedule</p>
          </button>
        <button className={`group px-3 mx-2 text-xl hover:text-green border
            ${currentTab === 'teams' ? selected : ' hover:bg-grey hover:bg-opacity-50 border-grey'}`}
            onClick={clickSocial}>
          <p className={currentTab !== 'teams' ? 'group-hover:-translate-y-[2px]' : ''}>Teams</p>
          </button>
        </div>
    </nav>
  )
}

export default NavBar;

const selected = "text-green hover:text-green";