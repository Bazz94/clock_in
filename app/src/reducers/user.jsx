/*
  
*/
import { useReducer } from "react";

// Initial values for the reducer object
const initObj = {
  timezone: 0,
  worked7: 0,
  streak: 0,
  sickUsed: 0,
  leaveLeft: 0,
};

// Handles changes made to properties
function reducer(state, action) {
  switch (action.type) {
    // set
    case 'set': {
      // Check that the required vars are set from action param
      if (action.timezone === undefined && action.worked7 === undefined && action.streak === undefined
        && action.sickUsed === undefined && action.leaveLeft === undefined
      ) {
        throw Error('Incorrect properties for set on userReducer');
      }
      // If a property is set in the action param then it gets set in the reducers state
      return Object.fromEntries(
        Object.entries(state).map(([key, value]) => {
          // eslint-disable-next-line no-prototype-builtins
          if (action.hasOwnProperty(key)) {
            return [key, action[key]];
          } else {
            return [key, value];
          }
        })
      );
    }
    // set all
    case 'init': {
      if (action.user === undefined) {
        throw Error('Incorrect properties for init on userReducer');
      }
      return { ...action.user};
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

const useUserReducer = () => {
  const [state, dispatch] = useReducer(reducer, initObj);
  return [state, dispatch];
};

export default useUserReducer;