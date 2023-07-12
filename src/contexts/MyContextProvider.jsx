import { createContext, useState } from 'react';

// Create a context
const MyContext = createContext(null);

// Create a provider component
function MyContextProvider({ children }) {
  const [user_id, setUser_id] = useState();

  const updateUser_id = (newValue) => {
    setUser_id(newValue);
  }

  return (
    <MyContext.Provider value={{ user_id, updateUser_id }}>
      {children}
    </MyContext.Provider>
  );
}
export { MyContext, MyContextProvider };