require('dotenv').config();

const express = require('express');
const app = express();
const { MongoClient } = require("mongodb");
var cors = require('cors')

// Connect to database
const client = new MongoClient(process.env.DATABASE_URL);

async function run() {
  try {
    const database = client.db(process.env.DATABASE_NAME);
    console.log('Connected to db');
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

// Set up CORS
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// test route
app.get('/', async (req, res) => {
  // test
    return res.status(200).json("clockIn api is working");
});

// Login and Sign up
const authRouter = require('./routes/auth.js');
app.use('/auth', authRouter);

// Users
const usersRouter = require('./routes/users.js');
app.use('/users', usersRouter);

// Days
const daysRouter = require('./routes/days.js');
app.use('/days', daysRouter);

// Listen for connections
app.listen(8080, () => console.log('Server started'));