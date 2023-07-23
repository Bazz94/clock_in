import { useEffect, useRef, useState } from "react";

const ScheduleUI = () => {
  const startWorkRef = useRef();
  const endWorkRef = useRef();
  const [daysToWork, setDaysToWork] = useState([]);
  const [workStarts, setWorkStarts] = useState('00:00');
  const [workEnds, setWorkEnds] = useState('00:00');
  const [estimateHr, setEstimateHr] = useState(0);
  console.log(workEnds)

  useEffect(() => {
  },[])

  function handleSubmit() {
    
  }

  function changeWorkStart(e) {
    setWorkStarts(e.target.value);
  }

  function changeWorkEnd(e) {
    setWorkEnds(e.target.value);
  }

  return (
    <div className='flex flex-row flex-wrap sm:flex-1 min-h-[400px]'>
      <div className='flex-1 h-full m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
        <form className="flex flex-col items-center justify-center w-full h-full p-2"
          onSubmit={handleSubmit}>
            <h2 className='m-5 text-3xl'>
              Schedule
            </h2>
            <div className='flex flex-col items-center justify-center flex-1'>
              <div className="flex m-3 w-[366px]">
                <label className="w-32">Days to work: </label>
                <WeekPicker daysToWork={daysToWork} setDaysToWork={setDaysToWork}/>
              </div>
              <div className="flex m-3 w-[366px]">
                <label className="w-32">Work starts: </label>
                <input className="flex tracking-wider text-black hover:scale-105"
                  ref={startWorkRef}
                  type="time"
                  value={workStarts}
                  onChange={changeWorkStart}
                />
              </div>
              <div className="flex m-3  w-[366px]">
                <label className="w-32">Work ends: </label>
                <input className="flex tracking-wider text-black hover:scale-105"
                  ref={endWorkRef}
                  type="time"
                  value={workEnds}
                  onChange={changeWorkEnd}
                />
              </div>
              <div className="flex m-6 justify-center w-[366px]">
                <p className="">45 hours per week</p>
              </div>
              <button className='p-2 mt-2 rounded-lg bg-neutral-600 text-md hover:scale-105' type="submit">
                Sign up
              </button>
            </div>
        </form>
      </div>
    </div>
  )
} 

export default ScheduleUI;


const WeekPicker = ({ daysToWork, setDaysToWork }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S',];
  return (
    <div className="flex">
      {days.map((day, index) => {
        return (
          <button 
            key={index}
            className={`flex justify-center w-6 px-3 mx-1 align-middle rounded-full cursor-pointer hover:scale-105 border border-neutral-500
              ${daysToWork.find(item => item === index) != null ? "bg-neutral-500" : "border"}`}
            onClick={(e) => {
              e.preventDefault();
              console.log('clicked', daysToWork.find(item => item === index) != null);
              daysToWork.find(day => day === index) != null
                ? setDaysToWork(daysToWork.filter(item => item !== index))
                : setDaysToWork([...daysToWork, index]);
            }}
          >
            {day}
          </button>
        )
      })}
      
    </div>
  )
}