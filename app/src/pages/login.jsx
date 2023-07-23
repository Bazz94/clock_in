import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import LoadingComponent from '../components/loading.jsx';
import { MyContext } from '../contexts/MyContextProvider.jsx';
import config from '../config/config.js';
import Popup from '../components/popup.jsx';

export default function Login() {
  const { token, updateToken } = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    // Format validation
    if (!email) {
      setErrorMessage('Please enter a email');
      setOpenErrorDialog(true);
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter a password');
      setOpenErrorDialog(true);
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Incorrect email or password');
      setOpenErrorDialog(true);
      return false;
    }
    if (password.length < 8) {
      setErrorMessage('Incorrect email or password');
      setOpenErrorDialog(true);
      return false;
    }
    // API call
    const requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': JSON.stringify({ email: email, password: password })
      }
    };
    setIsLoading(true);
    // eslint-disable-next-line no-undef
    fetch(`${config.apiUrl}/auth`, requestOptions)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      if (res.status === 500) {
        throw Error('Server error');
      }
      if (res.status === 400) {
        throw Error('Incorrect email or password');
      }
      throw Error('Failed to connect to server');
    }).then((data) => {
      // Login and navigate to Home page
      updateToken(data.token);
      setIsLoading(false);
      navigate("/home");
    }).catch((err) => {
      setIsLoading(false);
      setErrorMessage(err.message);
      setOpenErrorDialog(true);
      return false;
    });
  }

  function handleSignUp() {
    navigate("/signup");
  }

  return isLoading ? (<LoadingComponent />) : (
    <div className='w-screen, h-screen flex justify-center items-center p-5 sm:p-10'>
      <form className='min-w-[350px] min-h-[430px] flex flex-col items-center w-full p-10 rounded-lg sm:5/6 md:w-7/12 lg:w-1/2 h-1/2 bg-neutral-800' 
      onSubmit={handleLogin}>
        <h2 className='m-5 text-5xl'>
          Login
        </h2>
        <div className='flex flex-col items-center justify-center flex-1'>
          <label className='w-64 py-3'>
            Email
          </label>
          <input className='w-64 mx-5 text-black hover:scale-105 focus:scale-105'
            type="text"
            value={email}
            
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className='w-64 py-3'>
            Password
          </label>
          <input className='w-64 text-black hover:scale-105 focus:scale-105'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className='p-3 text-xl rounded-lg mt-9 hover:scale-105 bg-neutral-600' type="submit">
            Login
          </button>
          <button className='p-2 mt-2 rounded-lg hover:underline text-md hover:scale-105' onClick={handleSignUp}>
            Sign up
          </button>
        </div>
      </form>
      <Popup
        openErrorDialog={openErrorDialog}
        setOpenErrorDialog={setOpenErrorDialog}
        errorMessage={errorMessage}
      />
    </div>
  )
}