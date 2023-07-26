import express, { json } from 'express';
import cors from 'cors';
import "./loadEnvironment.mjs";
import rateLimit from 'express-rate-limit';


const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Max number of requests per windowMs
});

// Set up CORS
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Middleware
app.use(limiter);
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
import usersRouter from './routes/user.mjs';
app.use('/user', usersRouter);

// CurrentDay
import currentDayRouter from './routes/currentDay.mjs';
app.use('/currentDay', currentDayRouter);

// Schedule
import scheduleRouter from './routes/schedule.mjs';
app.use('/schedule', scheduleRouter);

// Listen for connections
app.listen(process.env.PORT, () => console.log('Server started'));