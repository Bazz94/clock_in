function Status() {
  return (
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
  )
}

export default Status;