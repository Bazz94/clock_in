import { useContext, useEffect, useRef, useCallback } from 'react';
import { MyContext } from '../contexts/MyContextProvider.jsx';
import { useNavigate } from "react-router-dom";


function SideDrawer({ openSideDrawer, setOpenSideDrawer }) {
  const animation = `${openSideDrawer ? 'translate-x-0' : '-translate-x-full'} z-10 fixed top-0 left-0 transition-transform duration-300 ease-out w-64 h-full `
  const { updateToken } = useContext(MyContext);
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  
  const handleClickOutside = useCallback((event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        document.removeEventListener('click', handleClickOutside);
        setOpenSideDrawer(false)
      }
  },[setOpenSideDrawer]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);



  function clickLogOut() {
    updateToken(null);
    navigate("/login");
  }

  function clickReset() {

  }

  return (
    <div ref={drawerRef} className={`${animation} flex flex-col bg-grey border-r border-white border-opacity-10`}>
      <button 
        className="flex items-center justify-center h-20 p-2 border-none rounded-md hover:bg-opacity-10 hover:bg-black text-green text toggle-button hover:scale-110"
        onClick={() => setOpenSideDrawer(false)}
      >
        <LeftIcon/>
      </button>
      <button
        className="flex items-center justify-center h-20 p-2 border-none rounded-md hover:bg-opacity-10 hover:bg-black toggle-button hover:scale-105"
        onClick={clickLogOut}
      >
        <p>Log out</p>
        <svg className="w-6 h-6 m-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      </button>
      <button
        className="flex items-center justify-center h-20 p-2 border-none rounded-md hover:bg-opacity-10 hover:bg-black toggle-button hover:scale-105"
        onClick={clickReset}
      >
        <p className='text-red'>Reset</p>
        <svg className="w-6 h-6 m-2 text-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
      <div className="p-4 drawer-content">
        {/* Drawer content here */}
      </div>
    </div>
  );
}

export default SideDrawer;

function LeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
    </svg>
  )
}