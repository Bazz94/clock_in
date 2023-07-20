import { Router } from 'express';
const router = Router();
import db from '../db/conn.mjs';

// Get user
router.get('/id', async (req, res) => {
  if (req.params.id == null) {
    return res.status(400).json({ message: "User id is required" });
  }

  const query = { _id: req.params.id };
  const options = {
    projection: { days: 0, email: 0 },
  };
  
  try {
    let users = db.collection("users");
    let user = await users.findOne(query, options);
    res.status(200).json({ data: user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update user 
router.patch('/', async (req, res) => {
  try {
    let users = await db.collection("users");
    let results = await users.findOne({});
    res.status(200).json({message: "User created"});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;