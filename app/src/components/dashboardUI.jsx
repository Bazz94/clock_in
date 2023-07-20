const DashboardUI = () => {
      return (
        <div className='flex flex-row flex-wrap sm:flex-1 min-h-[400px]'>
          <div className='flex-1 m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
            <div className="flex flex-col items-center justify-center w-full h-full p-2">
              <p className="p-3 text-lg">
                Current Event</p>
              <p className="pb-8 text-2xl">
                Working</p>
              <button className="p-2 m-1 rounded-3xl w-28 hover:scale-105 bg-neutral-500">
                Clock-in</button>
              <button className="p-2 m-1 rounded-3xl w-28 hover:scale-105 bg-neutral-500">
                Start break</button>
              <p className="pt-8 pb-3 text-lg">
                Up coming</p>
              <p className="pb-6 text-2xl">
                Clock-out</p>
            </div>
          </div>
          <div className='flex-1 m-2 mt-0 border shadow-md sm:m-4 sm:mt-0 border-neutral-800 rounded-xl'>
            <div className="flex flex-col items-center justify-center w-full h-full p-2">
              <p className="p-1 text-lg">
                Work day</p>
              <p className="pb-4 text-2xl">
                6</p>
              <p className="pb-1 text-lg">
                Work Week</p>
              <p className="pb-4 text-2xl">
                38</p>
              <p className="pb-1 text-lg">
                Perfect Streak</p>
              <p className="pb-4 text-2xl">
                56</p>
              <p className="pb-1 text-lg">
                Consistency</p>
              <p className="pb-2 text-2xl">
                38</p>
            </div>
          </div>
        </div>
      )
    }

export default DashboardUI;