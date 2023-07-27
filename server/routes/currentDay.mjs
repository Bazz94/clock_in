import { Router } from 'express';
const router = Router();
import db from '../db/conn.mjs';
import authToken from '../middleware/authenticateToken.mjs';
import { ObjectId } from 'mongodb';

// Update currentDay
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