const LeavePopup = ({ openPopup, setOpenPopup, selectedDay, setSelectedDay, schedule, scheduleDispatch,isRemove  }) => {
  if (!openPopup) return null;

  function handleClose() {
    setSelectedDay(null);
    setOpenPopup(false)
  }

  function handleSick() {
    scheduleDispatch({
      type: 'set',
      scheduledSick: [ ...schedule.scheduledSick, selectedDay],
      sickUsed: schedule.sickUsed + 1,
    });
    setSelectedDay(null);
    setOpenPopup(false);
  }

  function handleLeave() {
    scheduleDispatch({
      type: 'set',
      scheduledLeave: [...schedule.scheduledLeave, selectedDay],
      leaveUsed: schedule.leaveUsed - 1,
    });
    setSelectedDay(null);
    setOpenPopup(false);
  }

  function handleRemove() {
    if (schedule.scheduledLeave.find(day => sameDay(day, selectedDay))) {
      scheduleDispatch({
        type: 'set',
        scheduledLeave: schedule.scheduledLeave.filter(item => !sameDay(item, selectedDay)),
        leaveUsed: schedule.leaveUsed - 1,
      });
    }
    if (schedule.scheduledSick.find(day => sameDay(day, selectedDay))) {
      scheduleDispatch({
        type: 'set',
        scheduledSick: schedule.scheduledSick.filter(item => !sameDay(item, selectedDay)),
        sickUsed: schedule.sickUsed - 1,
      });
    }
    setSelectedDay(null);
    setOpenPopup(false)
  }

  return (
    <div className="absolute z-10 flex items-center justify-center w-full h-full -translate-x-1/2 -translate-y-1/2 rounded-lg opacity-100 top-1/2 left-1/2 bg-grey">
      <div className="w-full mx-3 h-full min-h-[300px] min-w-[300px] flex flex-col items-center justify-center ">
      <p className='p-10 pb-1 text-white text-opacity-60'>
        {`Pick leave type for`}
      </p>
      <p className='p-10 pt-0'>
        {formatDate(getLocalDate(selectedDay))}
      </p>
      <button className={` m-2 p-2 w-16 rounded-lg hover:scale-105 bg-green text-black
        ${isRemove && "hidden"}`} 
        onClick={handleSick}
      >
        Sick
      </button>
      <button className={`p-2 w-20  m-2 rounded-lg hover:scale-105 bg-green text-black
        ${isRemove && "hidden"}`} onClick={handleLeave}>
        Leave
      </button>
      <button className={`p-2 w-20  m-2 rounded-lg hover:scale-105 bg-red
        ${!isRemove && "hidden"}`} onClick={handleRemove}>
        Remove
      </button>
      <button className="w-20 p-2 m-2 rounded-lg hover:scale-105 bg-red" onClick={handleClose}>
        Cancel
      </button>
      </div>
    </div>
  );
};

export default LeavePopup;


function sameDay(date1, date2) {
  const newDate1 = new Date(date1);
  const newDate2 = new Date(date2);
  const result = newDate1.toDateString().slice(0, 10) === newDate2.toDateString().slice(0, 10);
  return result;
}


function formatDate(yyyy_mm_dd) {
  const [year, month, day] = yyyy_mm_dd.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  const formattedDate = `${parseInt(day, 10)} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
  return formattedDate;
}


function getLocalDate(now) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;
  return localDate;
}