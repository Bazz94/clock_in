import { createContext, useEffect, useState } from 'react';

// Create a context
const MyContext = createContext(null);

// Create a provider component
function MyContextProvider({ children }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(getTime());
    setInterval(() => {
      setTime(getTime());
    }, 60 * 1000);
  }, []);

  const [user_id, setUser_id] = useState();

  const updateUser_id = (newValue) => {
    setUser_id(newValue);
  }

  return (
    <MyContext.Provider value={{ user_id, updateUser_id, time }}>
      {children}
    </MyContext.Provider>
  );
}
export { MyContext, MyContextProvider };


function getTime() {
  const date = new Date();
  const formattedTime = date.toLocaleTimeString('en-Gb', { hour: '2-digit', minute: '2-digit', hour12: false });
  return formattedTime;
}