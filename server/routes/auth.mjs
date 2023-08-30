import { Router } from "express";
const router = Router();
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Login
router.get("/", async (req, res) => {
	const authorizationHeader = req.headers.authorization;
	let email, password;
	if (authorizationHeader) {
		const credentials = JSON.parse(authorizationHeader);
		email = credentials.email;
		password = credentials.password;
	}
	// check that the required vars are set
	if (!email) {
		return res.status(400).json("email is required");
	}
	if (!password) {
		return res.status(400).json("password is required");
	}

	const query = { email: email };

	try {
		// Validate credentials
		let users = await db.collection("users");
		let user = await users.findOne(query);
		if (!user) {
			return res.status(400).json("credentials are incorrect");
		}
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res.status(400).json("credentials are incorrect");
		}

		const currentTimestamp = Math.floor(Date.now() / 1000);
		const expireDate = currentTimestamp + 60 * 60 * 24 * 7; // +7 days
		const payload = {
			aud: user._id,
			iat: currentTimestamp,
			exp: expireDate,
			refreshed: false,
		};
		const token = jwt.sign(payload, process.env.ACCESS_TOKEN);
		// return token
		res.status(200).json({ token: token });
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

// Create user and login
router.post("/", async (req, res) => {
	const authorizationHeader = req.headers.authorization;
	const timezone = req.body.timezone;
	let email, password, name;
	if (authorizationHeader) {
		const credentials = JSON.parse(authorizationHeader);
		email = credentials.email;
		password = credentials.password;
		name = credentials.name;
	}
	// check that the required vars are set
	if (!email) {
		return res.status(400).json("email is required");
	}
	if (!password) {
		return res.status(400).json("password is required");
	}
	if (!name) {
		return res.status(400).json("username is required");
	}
	// Hash password
	const saltRounds = 10;
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, saltRounds);
	} catch (err) {
		return res.status(500).json(err.message);
	}
	if (!hashedPassword) {
		return res.status(500).json("hashing failed");
	}

	const query = { email: email };
	const options = {
		projection: { _id: 1 },
	};

	try {
		// Check that email is unique
		let users = db.collection("users");
		let user = await users.findOne({ query, options });
		if (user) {
			return res.status(400).json("Email already exists");
		}
		// Create User
		const date = new Date();
		let newUser = {
			email: email,
			password: hashedPassword,
			name: name,
			timezone: timezone,
			startedDate: date,
			worked7: 0,
			team: null,
			schedule: {
				workStarts: null,
				workEnds: null,
				workdays: [],
				scheduledSick: [],
				scheduledLeave: [],
				sickUsed: 0,
				annulLeave: 18,
				leaveUsed: 0,
			},
			currentDay: {
				status: "current",
				date: date,
				worked: 0,
				workStarts: [],
				workEnds: [],
				clockedIn: [],
				clockedOut: [],
				startedBreak: [],
				endedBreak: [],
			},
			days: [],
		};
		let result = await users.insertOne(newUser);

		// Create token
		const currentTimestamp = Math.floor(Date.now() / 1000);
		const expireDate = currentTimestamp + 60 * 60 * 24 * 7; // +7 days
		const payload = {
			aud: result.insertedId,
			iat: currentTimestamp,
			exp: expireDate,
			refreshed: false,
		};
		const token = jwt.sign(payload, process.env.ACCESS_TOKEN);
		// return user id
		res.status(200).json({ token: token });
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

export default router;
