import { createContext, useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import config from '../config/config';

// Create a context
const MyContext = createContext(null);
const cookieOptions = { expires: 7, domain: config.domain, secure: true };

// Create a provider component
function MyContextProvider({ children }) {
  const canStoreCookies = useRef(cookiesAvailable());
  const [time, setTime] = useState(null);
  const [token, setToken] = useState(canStoreCookies.current ? Cookies.get('token') : null);

  const updateToken = (newValue) => {
    setToken(newValue);
    if (canStoreCookies.current) {
      if (newValue == null) {
        Cookies.remove('token', cookieOptions);
        return false;
      }
      Cookies.set('token', newValue, cookieOptions);
    }
  }

  useEffect(() => {
    setTime(getTime());
    const date = new Date();
    setTimeout(() => {
      setTime(getTime());
      setInterval(() => {
        setTime(getTime());
      }, 60 * 1000);
    }, (60 - date.getSeconds()) * 1000);
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


function cookiesAvailable() {
  try {
    let testKey = 'test';
    Cookies.set(testKey, testKey, cookieOptions);
    Cookies.remove(testKey, cookieOptions);
    return true;
  } catch (e) {
    return false;
  }
}