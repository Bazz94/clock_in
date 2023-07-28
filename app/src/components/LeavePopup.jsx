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
    <div className="absolute z-10 flex items-center justify-center w-full h-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <div className="w-full mx-3 h-full min-h-[300px] min-w-[300px] flex flex-col items-center justify-center border rounded-lg opacity-100 bg-neutral-800">
      <p className='p-10'>
        {'Pick leave type for ' + selectedDay.toISOString().slice(0,10)}
      </p>
      <button className={`p-3 m-2 rounded-lg hover:scale-105 bg-neutral-600
        ${isRemove && "hidden"}`} 
        onClick={handleSick}
      >
        Sick
      </button>
      <button className={`p-3 m-2 rounded-lg hover:scale-105 bg-neutral-600
        ${isRemove && "hidden"}`} onClick={handleLeave}>
        Leave
      </button>
      <button className={`p-3 m-2 rounded-lg hover:scale-105 bg-neutral-600
        ${!isRemove && "hidden"}`} onClick={handleRemove}>
        Remove
      </button>
      <button className="p-3 m-2 rounded-lg hover:scale-105 bg-neutral-600" onClick={handleClose}>
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