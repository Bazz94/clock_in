

const Popup = ({ openErrorDialog, setOpenErrorDialog, errorMessage }) => {
  if (!openErrorDialog) return null;

  return (
    <div className="absolute z-10 flex items-center justify-center w-full h-full bg-black bg-opacity-50" 
      onClick={() => setOpenErrorDialog(false)}>
      <div className="min-h-[300px] min-w-[300px] flex flex-col items-center justify-center w-1/3 border rounded-lg opacity-100 bg-neutral-800 h-1/3">
      <p className='p-10'>
          {errorMessage}
      </p>
        <button className="p-3 rounded-lg hover:scale-105 bg-neutral-600" onClick={() => setOpenErrorDialog(false)}>
        close
      </button>
      </div>
    </div>
  );
};

export default Popup;