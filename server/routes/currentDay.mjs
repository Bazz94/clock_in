import { Router } from 'express';
const router = Router();
import db from '../db/conn.mjs';
import authToken from '../middleware/authenticateToken.mjs';
import { ObjectId } from 'mongodb';

// Update currentDay
router.patch('/', authToken, async (req, res) => {
  const uid = req.auth.aud;
  const { status, worked, workStarts, workEnds,
    clockedIn, clockedOut, startedBreak, endedBreak, currentDay } = req.body;

  try {
    // Get user document
    const query = { _id: new ObjectId(uid) };
    const options = {
      sort: { "days.date": -1 },
      projection: { days: { $slice: -182 }, password: 0 },
    };
    let users = await db.collection("users");
    let user = await users.findOne(query, options);
    if (!user) {
      return res.status(404).json("User not found");
    }

    let newCurrentDay = user.currentDay;
    if (status) newCurrentDay.status = status;
    if (worked) newCurrentDay.worked = worked;
    if (workStarts) newCurrentDay.workStarts = workStarts;
    if (workEnds) newCurrentDay.workEnds = workEnds;
    if (clockedIn) newCurrentDay.clockedIn = clockedIn;
    if (clockedOut) newCurrentDay.clockedOut = clockedOut;
    if (startedBreak) newCurrentDay.startedBreak = startedBreak;
    if (endedBreak) newCurrentDay.endedBreak = endedBreak;
    if (currentDay) newCurrentDay = currentDay;

    if (!currentDay && !status && !worked && !workStarts && !workEnds
      && !clockedIn && !clockedOut && !startedBreak && !endedBreak
    ) {
      return res.status(402).json("Update data required");
    }
    

    // update user.currentDay
    const updates = {
      $set: { currentDay: newCurrentDay }
    };
    let result = await users.updateOne(query, updates);
    if (!result) {
      return res.status(500).json("Update unsuccessful");
    }
    res.status(200).json("currentDay updated");
  } catch (err) {
    return res.status(500).json(err.message);
  }
});


export default router;