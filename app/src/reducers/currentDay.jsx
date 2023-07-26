/*
  
*/
import { useReducer } from "react";

// Initial values for the reducer object
const initObj = {
  status: null,
  worked: 0,
  date: new Date(),
  workStarts: {
    date: null
  },
  workEnds: {
    date: null
  },
  clockedIn: {
    dates: null
  },
  clockedOut: {
    dates: null
  },
  startedBreak: {
    dates: null
  },
  endedBreak: {
    dates: null
  },
};

// Handles changes made to properties
function reducer(state, action) {
  switch (action.type) {
    // set
    case 'set': {
      // Check that the required vars are set from action param
      if (action.status === undefined && action.worked === undefined && action.workStarts === undefined
        && action.workEnds === undefined && action.clockedIn === undefined && action.clockedOut === undefined
        && action.startedBreak === undefined && action.endedBreak === undefined
      ) {
        throw Error('Incorrect properties for set on useCurrentDayReducer');
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
      if (action.currentDay === undefined) {
        throw Error('Incorrect properties for init on useCurrentDayReducer');
      }
      return { ...action.currentDay };
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

const useCurrentDayReducer = () => {
  const [state, dispatch] = useReducer(reducer, initObj);
  return [state, dispatch];
};

export default useCurrentDayReducer;