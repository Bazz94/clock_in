/*
  
*/
import { useReducer } from "react";


// Handles changes made to properties
function reducer(state, action) {
  switch (action.type) {
    // set all
    case 'init': {
      if (action.schedule === undefined) {
        throw Error('Incorrect properties for init on scheduleReducer');
      }
      return { ...action.schedule };
    }
    // set
    case 'set': {
      // Check that the required vars are set from action param
      if (action.workStarts === undefined && action.workEnds === undefined && action.workdays === undefined
        && action.scheduledSick === undefined && action.scheduledLeave === undefined
      ) {
        throw Error('Incorrect properties for set on scheduleReducer');
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
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

const useScheduleReducer = () => {
  const [state, dispatch] = useReducer(reducer, null);
  return [state, dispatch];
};

export default useScheduleReducer;