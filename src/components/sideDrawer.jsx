import { useState, useEffect, useRef, useCallback } from 'react';

function SideDrawer({ openSideDrawer, setOpenSideDrawer }) {
  const animation = `${openSideDrawer ? 'translate-x-0' : '-translate-x-full'} z-10 fixed top-0 left-0 transition-transform duration-300 ease-out w-72 h-full `
  const drawerRef = useRef(null);
  
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openSideDrawer]);


  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        document.removeEventListener('click', handleClickOutside);
        setOpenSideDrawer(false)
      }
  }

  const handleButtonClick = (event) => {
    event.stopPropagation();
    setOpenSideDrawer(false);
  };

  return (
    <div ref={drawerRef} className={`${animation} flex flex-col  bg-neutral-800`}>
      <button 
        className="flex items-center justify-center h-20 p-2 border-none rounded-md toggle-button"
        onClick={handleButtonClick}
      >
        <LeftIcon/>
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