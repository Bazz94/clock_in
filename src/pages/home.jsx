import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Loading from '../components/loading.jsx';
import { MyContext } from '../contexts/MyContextProvider.jsx';

export default function Home() {
  const { user_id, updateUser_id } = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {

  }, []);

  async function HandleLogin() {

  }

  return isLoading ? (<Loading />) : (
    <div>
      <h1>Home</h1>
    </div>
  )
}