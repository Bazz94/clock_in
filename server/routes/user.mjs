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
      sort: { "days.date": -1 },
      projection: { days: { $slice: -182}, password: 0 },
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
      console.log('fired');
      const newCurrentDay = determineNewCurrentDay(user.schedule, user.timezone);
      const newStatus = user.currentDay.status === 'current' 
      ? determineStatus(user.currentDay, user.schedule, user.timezone) 
      : user.currentDay.status;
      
      const query = { _id: new ObjectId(uid) };
      const updates = {
        $push: {
          days: {
            status: newStatus,
            date: user.currentDay.date,
            worked: user.currentDay.worked,
          }
        },
        $set: {
          currentDay: newCurrentDay
        },
      };
      const options = {
        projection: { days: { $slice: -182 }, password: 0 },
        includeResultMetadata: false
      };
      user = await users.findOneAndUpdate(query, updates, options);
      if (!user) {
        return res.status(404).json("User not found");
      }
    }
    
    // Return user
    return res.status(200).json({ user: user });
  } catch (err) {
    return res.status(500).json(err.message);
  }
});


// Update leave, sickDays and timezone
router.patch('/', authToken, async (req, res) => {
  const uid = req.auth.aud;
  const { leaveLeft, sickUsed } = req.body;
  try {
    const query = { _id: new ObjectId(uid) };
    const updates = {
      $set: {leaveLeft: leaveLeft, sickUsed: sickUsed}
    };
    let users = await db.collection("users");
    let result = await users.updateOne(query, updates);
      if(!result) {
      return res.status(500).json("Update unsuccessful");
    }
    res.status(200).json({message: "User updated"});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;


function sameDay(date1, date2, timezone) {
  // adjust time to users timezone
  const newDate1 = new Date(date1);
  newDate1.setMinutes(newDate1.getMinutes() - timezone); // node uses utc time
  const newDate2 = new Date(date2);
  newDate2.setMinutes(newDate2.getMinutes() - timezone); // node uses utc time
  return (
    newDate1.getFullYear() === newDate2.getFullYear() &&
    newDate1.getMonth() === newDate2.getMonth() &&
    newDate1.getDate() === newDate2.getDate()
  );
}


function determineNewCurrentDay(schedule, timezone) {
  // determine work schedule day
  let workStarts = null;
  let workEnds = null; 
  if (schedule.workStarts) {
    workStarts = getCurrentDateWithTimeOf(new Date(schedule.workStarts), timezone);
    workEnds = getCurrentDateWithTimeOf(new Date(schedule.workEnds), timezone);
  }
  // Return new currentDay
  return {
    status: 'current',
    date: new Date(),
    worked: 0,
    workStarts: {
      date: workStarts
    },
    workEnds: {
      date: workEnds
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
  }
}

function determineStatus(day, schedule, timezone) {
  const date = new Date(day.date);
  if (!schedule.workStarts) {
    if (day.clockedIn.dates && day.clockedOut.dates) return 'perfect';
    return 'none';
  }

  // Not working today
  const isLeaveDay = schedule.scheduledLeave.find(leaveDate => sameDay(new Date(leaveDate), date, timezone));
  if (isLeaveDay) return 'leave';
  const isSickDay = schedule.scheduledSick.find(sickDate => sameDay(new Date(sickDate), date, timezone));
  if (isSickDay) return 'sick';
  if (!schedule.workdays.find(day => day === date.getDay())) return 'offDay';

  // Working today 
  if (!day.clockedIn.dates) return 'absent';
  if (day.workStarts.date < day.clockedIn.dates) return 'late';
  if (!day.clockedOut.dates) return 'none';
  const earliestClockOut = new Date(day.workEnds.date);
  earliestClockOut.setMinutes(earliestClockOut.getMinutes() - 15);
  if (earliestClockOut > day.clockedOut.dates) return 'halfDay';
  const latestClockOut = new Date(day.workEnds.date);
  latestClockOut.setMinutes(latestClockOut.getMinutes() + 15);
  if (latestClockOut < day.clockedOut.dates) return 'overtime'; // temp default
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