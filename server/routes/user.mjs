import { Router } from 'express';
const router = Router();
import db from '../db/conn.mjs';
import authToken from '../middleware/authenticateToken.mjs';
import { ObjectId } from 'mongodb';

// Get user
router.get('/', authToken, async (req, res) => {
  const uid = req.auth.aud;
  
  try {
    // Get user document
    const query = { _id: new ObjectId(uid) };
    const options = {
      projection: { days: { $slice: -364}, password: 0 },
    };
    let users = await db.collection("users");
    let user = await users.findOne(query, options);
    if (!user) {
      return res.status(404).json("User not found");
    }
    // Checking if currentDay has passed
    const date = new Date();
    const currentDayDate = new Date(user.currentDay.date);
    
    if (!sameDay(date, currentDayDate, user.timezone)) {
      // Push currentDay to days and init currentDay
      console.log('New Day');
      const newCurrentDay = determineNewCurrentDay(date ,user.schedule, user.timezone);
      let newDays = createNewDays(user.currentDay, user.schedule, user.timezone);
      const worked7 = calculateWorked7(newDays, user.days, user.timezone);

      const query = { _id: new ObjectId(uid) };
      const updates = {
        $push: {
          days: { $each: newDays, $sort: { date: -1 } }
        },
        $set: {
          currentDay: newCurrentDay,
          worked7: worked7,
        },
      };
      const options = {
        projection: { days: { $slice: -364 }, password: 0 },
        includeResultMetadata: false
      };
      user = await users.findOneAndUpdate(query, updates, options);
      if (!user) {
        return res.status(404).json("User not found");
      }
    }
    
    // Return user
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});


// Update user data
router.patch('/', authToken, async (req, res) => {
  const uid = req.auth.aud;
  const currentDay = req.body.currentDay;
  if (!currentDay) {
    return res.status(402).json("Update data required");
  }

  try {
    // update user.currentDay
    const query = { _id: new ObjectId(uid) };
    const updates = {
      $set: { currentDay: currentDay }
    };
    let users = await db.collection("users");
    let result = await users.updateOne(query, updates);
    if (!result) {
      return res.status(500).json("Update unsuccessful");
    }
    res.status(200).json("CurrentDay updated");
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

export default router;


function sameDay(date1, date2, timezone) {
  // adjust time to users timezone
  
  const newDate1 = new Date(date1);
  newDate1.setMinutes(newDate1.getMinutes() - timezone); // node uses utc time
  const newDate2 = new Date(date2);
  newDate2.setMinutes(newDate2.getMinutes() - timezone); // node uses utc time
  const result = newDate1.toISOString().slice(0, 10) === newDate2.toISOString().slice(0, 10);

  // console.log(newDate1.toISOString().slice(0, 10));
  // console.log(newDate2.toISOString().slice(0, 10));
  // console.log(result);

  return result;
}


function determineNewCurrentDay(date ,schedule, timezone) {
  const initCurrentDay = {
    status: 'current',
    date: date,
    worked: 0,
    workStarts: [],
    workEnds: [],
    clockedIn: [],
    clockedOut: [],
    startedBreak: [],
    endedBreak: [],
  };
  
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() - timezone);
  
  // No schedule
  if (schedule.workdays.length === 0) {
    return initCurrentDay;
  }

  // Not working today
  const isLeaveDay = schedule.scheduledLeave.find(leaveDate => sameDay(new Date(leaveDate), newDate, timezone));
  if (isLeaveDay) {
    return initCurrentDay;
  }

  const isSickDay = schedule.scheduledSick.find(sickDate => sameDay(new Date(sickDate), newDate, timezone));
  if (isSickDay) {
    return initCurrentDay;
  }

  if (schedule.workdays.find(day => day === newDate.getDay()) == null) {
    return initCurrentDay;
  } 

  // determine work schedule day
  const workStarts = getCurrentDateWithTimeOf(new Date(schedule.workStarts), timezone);
  const workEnds = getCurrentDateWithTimeOf(new Date(schedule.workEnds), timezone);

  // Return new currentDay
  return {
    status: 'current',
    date: date,
    worked: 0,
    workStarts: [workStarts],
    workEnds: [workEnds],
    clockedIn: [],
    clockedOut: [],
    startedBreak: [],
    endedBreak: [],
  }
}


function createNewDays(day, schedule, timezone) {
  const list = [];
  const currentDate = new Date();
  const newStatus = determineStatus(day, schedule, timezone);
  const newWorked = calculateWorked(day);
  const newDay = { status: newStatus, date: day.date, worked: newWorked };
  const lastDay = new Date(day.date)
  let dayDifference = getDifferenceInDays(currentDate, lastDay);
  dayDifference -= 1;
  for (let i = 1; i <= dayDifference; i++) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    const oldCurrentDay = determineNewCurrentDay(date, schedule, timezone);
    const oldStatus = determineStatus(oldCurrentDay, schedule, timezone);
    const oldWorked = calculateWorked(oldCurrentDay);
    let oldDay = { status: oldStatus, date: date, worked: oldWorked };
    list.push(oldDay);
  }
  list.push(newDay);
  return list;
}


function determineStatus(day, schedule, timezone) {
  const date = new Date();
 
  // Not working today
  const isLeaveDay = schedule.scheduledLeave.find(leaveDate => sameDay(new Date(leaveDate), date, timezone));
  if (isLeaveDay) return 'perfect';
  const isSickDay = schedule.scheduledSick.find(sickDate => sameDay(new Date(sickDate), date, timezone));
  if (isSickDay) return 'perfect';
  if (schedule.workdays.find(day => day === date.getDay() == null)) return 'perfect';

  // No schedule
  if (!day.workStarts[0]) {
    if (day.clockedIn[0] && day.clockedOut[0]) return 'perfect';
    return 'none';
  }

  // Working today 
  if (!day.clockedIn[0]) return 'absent';
  if (day.workStarts[0] < day.clockedIn[0]) return 'present';
  if (!day.clockedOut[0]) return 'present';
  const earliestClockOut = new Date(day.workEnds[0]);
  earliestClockOut.setMinutes(earliestClockOut.getMinutes() - 15);
  if (earliestClockOut > day.clockedOut[0]) return 'present';
  return 'perfect'; 
}


function getCurrentDateWithTimeOf(date, timezone) {
  // adjust timezone
  const newDate = new Date(date);
  const currentDate = new Date();
  newDate.setMinutes(newDate.getMinutes() - timezone);
  currentDate.setMinutes(currentDate.getMinutes() - timezone);
  // set time
  currentDate.setHours(newDate.getHours());
  currentDate.setMinutes(newDate.getMinutes());
  currentDate.setSeconds(newDate.getSeconds());
  // adjust to original timezone
  currentDate.setMinutes(currentDate.getMinutes() + timezone);
  return currentDate;
}


function calculateWorked(day) {
  let worked = 0;
  if (!day) return worked;
  const now = new Date();
  for (let i = 0; i < day.clockedIn.length; i++) {
    if (day.clockedIn[i]) {
      const WorkStarted = new Date(day.clockedIn[i]);
      WorkStarted.setSeconds(0);
      if (day.clockedOut[i]) {
        const WorkEnded = new Date(day.clockedOut[i]);
        worked += WorkEnded - WorkStarted;
      } else {
        worked += now - WorkStarted;
      }
    }
  }
  return worked;
}


function getDifferenceInDays(date1, date2) {
  const diffInMilliseconds = Math.abs(date1 - date2);
  const daysDifference = Math.floor(diffInMilliseconds / (24 * 60 * 60 * 1000));
  return daysDifference;
}

function calculateWorked7(newDays, days) {
  let worked7 = 0;
  const limit = new Date();
  limit.setDate(limit.getDate() - 8);
  limit.setHours(0);
  limit.setMinutes(0);
  let count = 0;
  let flag = true;
  while (flag) {
    if (days[count]) {
      if (new Date(days[count].date) > limit) {
        worked7 += days[count].worked;
        count++;
      } else {
        flag = false;
      }
    } else {
      flag = false;
    }
  }

  worked7 += newDays[0].worked;
 
  return worked7;
}