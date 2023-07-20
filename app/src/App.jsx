import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MyContextProvider } from './contexts/MyContextProvider.jsx';
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';

function App() {
  return (
    <MyContextProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/*" element={<Navigate to="/login"/>}/>
        </Routes>
      </Router>
    </MyContextProvider>
  )
}

export default App
