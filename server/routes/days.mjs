import { Router } from 'express';
const router = Router();
import db from '../db/conn.mjs';
import authToken from '../middleware/authenticateToken.mjs';

// Get all days
router.get('/', authToken, async (req, res) => {
  const uid = req.auth.aud;

  try {
    // const query = { _id: };
    // const options = {
    //   projection: { password: 0 },
    // };
    // let users = await db.collection("users");
    // let user = await users.findOne(query, options);

    return res.status(200).json({  });
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

// Update user days


export default router;