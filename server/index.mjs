import express, { json } from 'express';
import cors from 'cors';
import "./loadEnvironment.mjs";


const app = express();

// Set up CORS
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Middleware
app.use(cors(corsOptions));
app.use(json());

// test route
app.get('/', async (req, res) => {
  // test
    return res.status(200).json("clockIn api is working");
});

// Login and Sign up
import authRouter from './routes/auth.mjs';
app.use('/auth', authRouter);

// Users
import usersRouter from './routes/users.mjs';
app.use('/user', usersRouter);

// Days
import daysRouter from './routes/days.mjs';
app.use('/days', daysRouter);

// Listen for connections
app.listen(process.env.PORT, () => console.log('Server started'));