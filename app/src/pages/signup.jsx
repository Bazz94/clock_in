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
  const [error, setError] = useState(false); // {message: 'error', redirect: false}
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState('');


  useEffect(() => {
    if (token != null) {
      navigate("/home");
    }
  }, [navigate, token]);

  async function handleSignup(e) {
    e.preventDefault();
    // Format validation
    if (!username) {
      setError({ message: 'Please enter a username' });
      return false;
    }
    if (!email) {
      setError({ message: 'Please enter an email' });
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError({ message: 'Please enter a valid email' });
      return false;
    }
    if (!password) {
      setError({ message: 'Please enter a password' });
      return false;
    }
    if (password.length < 8) {
      setError({ message: 'Passwords should be more than 8 characters' });
      return false;
    }
    if (password !== password2) {
      setError({ message: 'Passwords do not match' });
      return false;
    }
    // API call
    const data = {
      timezone: new Date().getTimezoneOffset(),
    }
    const requestOptions = {
      method: 'POST',
      headers: {
        "Content-type": "application/json",
        'Authorization': JSON.stringify({ email: email, password: password, name: username })
      },
      body: JSON.stringify(data),
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
          throw Error('Email is already in use');
        }
        throw Error('Failed to connect to server');
      }).then((data) => {
        // Login and navigate to Home page
        updateToken(data.token);
        setIsLoading(false);
        navigate("/home");
      }).catch((err) => {
        setIsLoading(false);
        setError({ message: 'Login failed: ' + err.message });
        return false;
      });
  }

  function handleBackToLogin() {
    navigate("/login");
  }

  return isLoading ? (<LoadingComponent />) : (
    <div className='w-screen, h-screen flex justify-center items-center p-5 sm:p-10'>
      <form className='min-w-[350px] min-h-[530px] flex flex-col items-center w-full p-10 rounded-lg sm:5/6 md:w-7/12 lg:w-1/2 h-4/6 bg-neutral-800' 
        onSubmit={handleSignup}>
        <h2 className='m-5 text-5xl'>
          Sign up
        </h2>
        <div className='flex flex-col items-center justify-center flex-1'>
          <label className='w-64 py-3'>
            Username
          </label>
          <input className='w-64 mx-5 text-black hover:scale-105 focus:scale-105'
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
          <label className='w-64 py-3'>
            Password
          </label>
          <input className='w-64 text-black hover:scale-105 focus:scale-105'
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
          <button className='p-3 text-xl rounded-lg mt-9 hover:scale-105 bg-neutral-600' type="submit">
            Sign up
          </button>
          <button className='p-2 mt-2 rounded-lg hover:underline text-md hover:scale-105' 
            onClick={handleBackToLogin}>
            Login
          </button>
        </div>
      </form>
      <Popup 
        error={error}
        setError={setError}
      />
    </div>
  )
}