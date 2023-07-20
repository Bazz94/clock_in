import { Router } from 'express';
const router = Router();
import db from '../db/conn.mjs';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


// Get user id
router.get('/', async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  let email, password;
  if (authorizationHeader) {
    const credentials = JSON.parse(authorizationHeader);
    email = credentials.email;
    password = credentials.password;
  }
  // check that the required vars are set
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "password is required" });
  }

  const query = { email: email };

  try {
    // Validate credentials
    let users = await db.collection("users");
    let user = await users.findOne(query);
    if (!user) {
      return res.status(400).json({ message: "credentials are incorrect" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "credentials are incorrect" });
    }

    const date = new Date();
    const currentTimestamp = Math.floor(Date.now() / 1000);
    date.setDate(date.getDate() + 7);
    const expireDate = Math.floor(date.getTime() / 1000);
    console.log(currentTimestamp, expireDate);
    const payload = {
      aud: user._id,
      iat: currentTimestamp,
      exp: expireDate,
      refreshed: false
    }
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN);
    // return token
    res.status(200).json({ token: token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// Create user
router.post('/', async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  let email, password, name;
  if (authorizationHeader) {
    const credentials = JSON.parse(authorizationHeader);
    email = credentials.email;
    password = credentials.password;
    name = credentials.name;
  }
  // check that the required vars are set
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "password is required" });
  }
  if (!name) {
    return res.status(400).json({ message: "username is required" });
  }
  // Hash password
  const saltRounds = 10;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  } catch(err) {
    return res.status(500).json({ message: err.message });
  }
  if (!hashedPassword) {
    return res.status(500).json({ message: "hashing failed" });
  }

  const query = { email: email };
  const options = {
    projection: { _id: 1 },
  };

  try {
    // Check that email is unique
    let users = db.collection("users");
    let user = await users.findOne({query, options});
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Create User
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    let newUser = {

      email: email,
      password: hashedPassword,
      name: name,
      startedDate: date,
      worked7: 0,
      worked7goal: 0,
      streak: 0,
      consistency: 100,
      sickUsed: 0,
      leaveLeft: 0, 
      days: [
        {
          status: 'current',
          date: date,
        }
      ],
    }
    let result = await users.insertOne(newUser);

    // Create token
    const currentTimestamp = Math.floor(Date.now() / 1000);
    date.setDate(date.getDate() + 7);
    const expireDate = Math.floor(date.getTime() / 1000);
    console.log(currentTimestamp, expireDate);
    const payload = {
      aud: result.insertedId,
      iat: currentTimestamp,
      exp: expireDate,
      refreshed: false
    }
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN);
    // return user id
    res.status(200).json({ token: token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;