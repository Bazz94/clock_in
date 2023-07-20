import { createContext, useEffect, useState } from 'react';

// Create a context
const MyContext = createContext(null);

// Create a provider component
function MyContextProvider({ children }) {
  const [time, setTime] = useState(null);
  const [token, setToken] = useState();

  const updateToken = (newValue) => {
    setToken(newValue);
  }

  useEffect(() => {
    setTime(getTime());
    setInterval(() => {
      setTime(getTime());
    }, 60 * 1000);
  }, []);


  return (
    <MyContext.Provider value={{ token, updateToken, time }}>
      {children}
    </MyContext.Provider>
  );
}
export { MyContext, MyContextProvider };


function getTime() {
  const options = ['en-Gb', { hour: '2-digit', minute: '2-digit', hour12: false }]
  const date = new Date();
  const formattedTime = date.toLocaleTimeString(...options);
  return formattedTime;
}