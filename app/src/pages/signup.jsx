import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import LoadingComponent from '../components/loading.jsx';
import { MyContext } from '../contexts/MyContextProvider.jsx';

export default function Signup() {
  const { user_id, updateUser_id } = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (user_id != null) {
      navigate("/home");
    }
  }, [navigate, user_id]);

  async function HandleLogin() {

  }

  return isLoading ? (<LoadingComponent />) : (
    <div>
      <h3>Signup</h3>
    </div>
  )
}