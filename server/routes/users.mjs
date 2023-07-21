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

    // Add current day to days
    const date = new Date();
    const currentDayDate = user.currentDay.date;
    if (!sameDay(currentDayDate, date)) {
      // get schedule

      console.log('fired');
      const newCurrentDay = determineNewCurrentDay();

      const query = { _id: new ObjectId(uid) };
      const updates = {
        $push: {
          days: {
            status: determineStatus(user.currentDay),
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
    
    return res.status(200).json({ user: user });
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

// Update user leave and sickDays
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

function sameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function determineNewCurrentDay(schedule) {
  // determine work schedule
  let workStarts = null;
  let workEnds = null; 
  if (!schedule) {
    const date = Date();
    date.setHours(schedule.workStarts.h);
    date.setMinutes(schedule.workStarts.m);
    workStarts = date;
    date.setHours(schedule.workEnds.h);
    date.setMinutes(schedule.workEnds.m);
    workEnds = date;
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

function determineStatus(day) { // later > earlier
  if (day.workStarts.dates < day.clockedIn.date) {
    return'late';
  }
  return 'perfect'; // temp default
}