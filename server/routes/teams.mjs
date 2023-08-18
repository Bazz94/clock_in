import { Router } from "express";
const router = Router();
import db from "../db/conn.mjs";
import authToken from "../middleware/authenticateToken.mjs";
import { ObjectId } from "mongodb";

// Create team
router.post("/create", authToken, async (req, res) => {
	const uid = req.auth.aud;
	const teamName = req.body.teamName;
	if (!teamName) {
		return res.status(404).json("Required data not found");
	}

	try {
		// Get user
		const query = { _id: new ObjectId(uid) };
		const options = {
			projection: { team: 1 },
		};
		const users = await db.collection("users");
		const user = await users.findOne(query, options);
		if (!user) {
			return res.status(404).json("User not found");
		}
		// Check if user is already part of a team
		if (user.team) {
			return res.status(400).json("User is already part of a team");
		}

		// Update Teams
		const team = {
			name: teamName,
			admin: uid,
			members: [uid],
			code: null,
			codeExpires: null,
		};
		const teams = db.collection("teams");
		const result = await teams.insertOne(team);
		if (!result) {
			return res.status(500).json("Update unsuccessful");
		}

		// Return team id
		return res.status(200).json(result.insertedId);
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

// Join team
router.patch("/join", authToken, async (req, res) => {
	const uid = req.auth.aud;
	const inviteCode = req.body.code;
	if (!inviteCode) {
		return res.status(404).json("Required data not found");
	}
	try {
		// Get user
		const query0 = { _id: new ObjectId(uid) };
		const options0 = {
			projection: { team: 1 },
		};
		const users = await db.collection("users");
		const user = await users.findOne(query0, options0);
		if (!user) {
			return res.status(404).json("User not found");
		}
		// Check if already part of a team
		if (user.team) {
			return res.status(400).json("User is already part of a team");
		}

		// Get team document
		const query1 = { code: inviteCode };
		const teams = await db.collection("teams");
		const team = await teams.findOne(query1);
		if (!team) {
			return res.status(404).json("Team not found");
		}

		const date = new Date();
		const codeExpirationDate = new Date(team.codeExpires);
		if (date > codeExpirationDate) {
			return res.status(404).json("Team not found");
		}

		// Update user
		const query2 = { _id: new ObjectId(uid) };
		const updates2 = {
			$set: { team: team._id },
		};
		const result2 = await users.updateOne(query2, updates2);
		if (!result2) {
			return res.status(500).json("Update unsuccessful");
		}

		// Update Teams
		const query3 = { _id: new ObjectId(team._id) };
		const updates3 = {
			$push: {
				members: uid,
			},
		};
		const result = await users.updateOne(query3, updates3);
		if (!result) {
			return res.status(500).json("Update unsuccessful");
		}

		// Return team id
		return res.status(200).json(team._id);
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

// Create invite code
router.patch("/invite", authToken, async (req, res) => {
	const uid = req.auth.aud;
	const daysToExpire = 3;

	try {
		// Get user
		const query = { _id: new ObjectId(uid) };
		const options = {
			projection: { team: 1 },
		};
		const users = await db.collection("users");
		const user = await users.findOne(query, options);
		if (!user) {
			return res.status(404).json("User not found");
		}

		// Create Code
		const teams = await db.collection("teams");
		let isNotUnique = true;
		let inviteCode;
		do {
			inviteCode = generateInviteCode();
			const query2 = { code: inviteCode };
			const team = await teams.findOne(query2);
			if (!team) isNotUnique = false;
		} while (isNotUnique);

		const expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + daysToExpire);

		// Update team
		const query3 = { _id: new ObjectId(user.team), admin: new ObjectId(uid) };
		const updates3 = {
			$set: {
				code: inviteCode,
				codeExpires: expireDate,
			},
		};
		const result = await teams.updateOne(query3, updates3);
		if (!result) {
			return res.status(500).json("Update unsuccessful");
		}

		res.status(200).json(inviteCode);
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

// Leave team
router.patch("/leave", authToken, async (req, res) => {
	const uid = req.auth.aud;
	const team_id = req.body.team_id;
	if (!team_id) {
		return res.status(404).json("Required data not found");
	}

	// TODO: check if user is the admin, then check if there are 0 members

	try {
		// Update Teams
		const query1 = { _id: new ObjectId(team_id) };
		const update1 = {
			$pull: {
				members: uid,
			},
		};
		const teams = await db.collection("teams");
		const result = await teams.updateOne(query1, update1);
		if (!result) {
			return res.status(500).json("Update unsuccessful");
		}

		// Update User
		const query2 = { _id: new ObjectId(uid) };
		const updates2 = {
			$set: { team: null },
		};
		const users = await db.collection("users");
		const result2 = await users.updateOne(query2, updates2);
		if (!result2) {
			return res.status(500).json("Update unsuccessful");
		}

		res.status(200).json("Left team successful");
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

// Get Team data

export default router;

function generateInviteCode() {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let randomCode = "";
	const length = 6;
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		randomCode += charset[randomIndex];
	}

	return randomCode;
}
