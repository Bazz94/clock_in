import Clock from '../components/clock.jsx';

function NavBar({ userData, openSideDrawer, setOpenSideDrawer }) {

  function clickUsername() {
    setTimeout(() => {
      setOpenSideDrawer(!openSideDrawer);
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

  return (
    <nav className='flex justify-center w-screen h-20 bg-neutral-800'>
      <div className='flex content-center flex-1 max-w-7xl'>
        <button className='w-1/3 p-5 text-xl hover:scale-105'
          onClick={clickUsername}>
          {userData.name}
        </button>
        <div className='flex flex-row content-center justify-center w-1/3'>
          <button className='w-1/3 text-xl hover:scale-105 focus:underline focus:text-orange-400'
            onClick={clickHome}>
            Home
          </button>
          <button className='w-1/3 text-xl hover:scale-105 focus:underline focus:text-orange-400'
            onClick={clickSchedule}>
            Schedule
          </button>
          <button className='w-1/3 text-xl hover:scale-105 focus:underline focus:text-orange-400'
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