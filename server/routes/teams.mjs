import { Router, query } from "express";
const router = Router();
import db from "../db/conn.mjs";
import authToken from "../middleware/authenticateToken.mjs";
import { ObjectId } from "mongodb";

// Get team
router.get("/", authToken, async (req, res) => {
	const uid = req.auth.aud;

	try {
		// Get user
		const query0 = { _id: new ObjectId(uid) };
		const options0 = {
			projection: { team: 1 },
		};
		const users = db.collection("users");
		const user = await users.findOne(query0, options0);
		if (!user) {
			return res.status(404).json("User not found");
		}
		// Check if user is already part of a team
		if (!user.team) {
			return res.status(400).json("User is not part of a team");
		}

		// Find Team
		const query1 = { _id: new ObjectId(user.team) };
		const teams = db.collection("teams");
		const team = await teams.findOne(query1);
		if (!team) {
			return res.status(500).json("Update unsuccessful");
		}

		// Get team members data
		const query2 = { team: team._id };
		const options2 = {
			projection: {
				_id: 1,
				currentDay: 1,
				schedule: 1,
				worked7: 1,
				name: 1,
				days: { $slice: -364 },
				timezone: 1,
			},
		};
		const teamMembers = await users.find(query2, options2).toArray();
		if (!teamMembers) {
			return res.status(500).json("Update unsuccessful");
		}

		// Check if members are up to date
		const today = new Date();
		let newTeamMembers = await Promise.all(
			teamMembers.map(async (member) => {
				if (sameDay(member.currentDay.date, today, member.timezone)) {
					return member;
				}
				// update team member days
				console.log("Update team member: ", member._id);
				const newCurrentDay = determineNewCurrentDay(today, member.schedule, member.timezone);
				const newDays = createNewDays(member.currentDay, member.schedule, member.timezone);
				const worked7 = calculateWorked7(newDays, member.days, member.timezone);

				const query3 = { _id: member._id };
				const updates3 = {
					$push: {
						days: { $each: newDays, $sort: { date: -1 } },
					},
					$set: {
						currentDay: newCurrentDay,
						worked7: worked7,
					},
				};
				const options3 = {
					projection: { days: { $slice: -364 }, password: 0, email: 0, startedDate: 0, team: 0 },
					includeResultMetadata: false,
				};
				const updatedMember = await users.findOneAndUpdate(query3, updates3, options3);
				if (!updatedMember) {
					throw new Error("Employee update failed");
				}
				return updatedMember;
			})
		);

		// Return team id
		return res.status(200).json({ team: team, members: newTeamMembers });
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

// Create team
router.post("/create", authToken, async (req, res) => {
	const uid = req.auth.aud;
	const teamName = req.body.teamName;
	if (!teamName) {
		return res.status(404).json("Required data not found");
	}

	try {
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

		// Update User
		const query1 = { _id: new ObjectId(uid) };
		const update1 = {
			$set: {
				team: result.insertedId,
			},
		};
		const users = db.collection("users");
		const result1 = await users.updateOne(query1, update1);
		if (!result1) {
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
		const users = db.collection("users");
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
		const teams = db.collection("teams");
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
		const query3 = { _id: team._id };
		const updates3 = {
			$push: {
				members: uid,
			},
		};
		const result3 = await teams.updateOne(query3, updates3);
		if (!result3) {
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
	const daysToExpire = req.body.expire;
	if (!daysToExpire) {
		return res.status(404).json("Required data not found");
	}

	try {
		// Get user
		const query = { _id: new ObjectId(uid) };
		const options = {
			projection: { team: 1 },
		};
		const users = db.collection("users");
		const user = await users.findOne(query, options);
		if (!user) {
			return res.status(404).json("User not found");
		}

		// Create Code
		const teams = db.collection("teams");
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
		const query3 = { $and: [{ _id: new ObjectId(user.team) }, { admin: uid }] };
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

		res.status(200).json({ code: inviteCode, codeExpires: expireDate });
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

// Leave team
router.patch("/leave", authToken, async (req, res) => {
	const uid = req.auth.aud;
	const team_id = req.body.team_id;
	if (!team_id) {
		return res.status(400).json("Required data not found");
	}

	try {
		// Get team
		const query0 = { _id: new ObjectId(team_id) };
		const teams = db.collection("teams");
		const team = await teams.findOne(query0);
		if (!team) {
			return res.status(500).json("Team not found");
		}

		// Check if user is admin and if there are any members
		const user_is_admin = team.admin === uid;
		if (user_is_admin) {
			// Check if the user is the last member
			const user_is_last_member = team.members.length === 1;
			if (user_is_last_member) {
				// Delete the team
				const query3 = { _id: new ObjectId(team_id) };
				const result3 = await teams.deleteOne(query3);
				if (!result3) {
					return res.status(500).json("Update unsuccessful");
				}
			} else {
				// Set another member as new admin
				let newAdmin;
				let count = 0;
				while (team.members[count] && !newAdmin) {
					if (team.members[count] !== uid) {
						newAdmin = team.members[count];
					}
					count++;
				}

				if (!newAdmin) {
					throw new Error("Could not find a new admin");
				}

				const query4 = { _id: new ObjectId(team_id) };
				const update4 = {
					$set: {
						admin: newAdmin,
					},
				};
				const result4 = await teams.updateOne(query4, update4);
				if (!result4) {
					return res.status(500).json("Update unsuccessful");
				}
			}
		}

		// Remove user as member
		const query1 = { _id: new ObjectId(team_id) };
		const update1 = {
			$pull: {
				members: uid,
			},
		};
		const result = await teams.updateOne(query1, update1);
		if (!result) {
			return res.status(500).json("Update unsuccessful");
		}

		// Update the Users team id
		const query2 = { _id: new ObjectId(uid) };
		const updates2 = {
			$set: { team: null },
		};
		const users = db.collection("users");
		const result2 = await users.updateOne(query2, updates2);
		if (!result2) {
			return res.status(500).json("Update unsuccessful");
		}

		res.status(200).json("Left team successful");
	} catch (err) {
		return res.status(500).json(err.message);
	}
});

export default router;

function generateInviteCode() {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let randomCode = "";
	const length = 5;
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		randomCode += charset[randomIndex];
	}

	return "#" + randomCode;
}

function sameDay(date1, date2, timezone) {
	// adjust time to users timezone

	const newDate1 = new Date(date1);
	newDate1.setMinutes(newDate1.getMinutes() - timezone); // node uses utc time
	const newDate2 = new Date(date2);
	newDate2.setMinutes(newDate2.getMinutes() - timezone); // node uses utc time
	const result = newDate1.toISOString().slice(0, 10) === newDate2.toISOString().slice(0, 10);

	// console.log(newDate1.toISOString().slice(0, 10));
	// console.log(newDate2.toISOString().slice(0, 10));
	// console.log(result);

	return result;
}

function determineNewCurrentDay(date, schedule, timezone) {
	const initCurrentDay = {
		status: "current",
		date: date,
		worked: 0,
		workStarts: [],
		workEnds: [],
		clockedIn: [],
		clockedOut: [],
		startedBreak: [],
		endedBreak: [],
	};

	const newDate = new Date(date);
	newDate.setMinutes(newDate.getMinutes() - timezone);

	// No schedule
	if (schedule.workdays.length === 0) {
		return initCurrentDay;
	}

	// Not working today
	const isLeaveDay = schedule.scheduledLeave.find((leaveDate) =>
		sameDay(new Date(leaveDate), newDate, timezone)
	);
	if (isLeaveDay) {
		return initCurrentDay;
	}

	const isSickDay = schedule.scheduledSick.find((sickDate) =>
		sameDay(new Date(sickDate), newDate, timezone)
	);
	if (isSickDay) {
		return initCurrentDay;
	}

	if (schedule.workdays.find((day) => day === newDate.getDay()) == null) {
		return initCurrentDay;
	}

	// determine work schedule day
	const workStarts = getCurrentDateWithTimeOf(new Date(schedule.workStarts), timezone);
	const workEnds = getCurrentDateWithTimeOf(new Date(schedule.workEnds), timezone);

	// Return new currentDay
	return {
		status: "current",
		date: date,
		worked: 0,
		workStarts: [workStarts],
		workEnds: [workEnds],
		clockedIn: [],
		clockedOut: [],
		startedBreak: [],
		endedBreak: [],
	};
}

function createNewDays(day, schedule, timezone) {
	const list = [];
	const currentDate = new Date();
	const newStatus = determineStatus(day, schedule, timezone);
	const newWorked = calculateWorked(day);
	const newDay = { status: newStatus, date: day.date, worked: newWorked };
	const lastDay = new Date(day.date);
	let dayDifference = getDifferenceInDays(currentDate, lastDay);
	dayDifference -= 1;
	for (let i = 1; i <= dayDifference; i++) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const oldCurrentDay = determineNewCurrentDay(date, schedule, timezone);
		const oldStatus = determineStatus(oldCurrentDay, schedule, timezone);
		const oldWorked = calculateWorked(oldCurrentDay);
		const oldDay = { status: oldStatus, date: date, worked: oldWorked };
		list.push(oldDay);
	}
	list.push(newDay);
	return list;
}

function determineStatus(day, schedule, timezone) {
	const date = new Date();

	// Not working today
	const isLeaveDay = schedule.scheduledLeave.find((leaveDate) =>
		sameDay(new Date(leaveDate), date, timezone)
	);
	if (isLeaveDay) return "perfect";
	const isSickDay = schedule.scheduledSick.find((sickDate) =>
		sameDay(new Date(sickDate), date, timezone)
	);
	if (isSickDay) return "perfect";
	if (schedule.workdays.find((day) => (day === date.getDay()) == null)) return "perfect";

	// No schedule
	if (!day.workStarts[0]) {
		if (day.clockedIn[0] && day.clockedOut[0]) return "perfect";
		return "none";
	}

	// Working today
	if (!day.clockedIn[0]) return "absent";
	if (day.workStarts[0] < day.clockedIn[0]) return "present";
	if (!day.clockedOut[0]) return "present";
	const earliestClockOut = new Date(day.workEnds[0]);
	earliestClockOut.setMinutes(earliestClockOut.getMinutes() - 15);
	if (earliestClockOut > day.clockedOut[0]) return "present";
	return "perfect";
}

function getCurrentDateWithTimeOf(date, timezone) {
	// adjust timezone
	const newDate = new Date(date);
	const currentDate = new Date();
	newDate.setMinutes(newDate.getMinutes() - timezone);
	currentDate.setMinutes(currentDate.getMinutes() - timezone);
	// set time
	currentDate.setHours(newDate.getHours());
	currentDate.setMinutes(newDate.getMinutes());
	currentDate.setSeconds(newDate.getSeconds());
	// adjust to original timezone
	currentDate.setMinutes(currentDate.getMinutes() + timezone);
	return currentDate;
}

function calculateWorked(day) {
	let worked = 0;
	if (!day) return worked;
	const now = new Date();
	for (let i = 0; i < day.clockedIn.length; i++) {
		if (day.clockedIn[i]) {
			const WorkStarted = new Date(day.clockedIn[i]);
			WorkStarted.setSeconds(0);
			if (day.clockedOut[i]) {
				const WorkEnded = new Date(day.clockedOut[i]);
				worked += WorkEnded - WorkStarted;
			} else {
				worked += now - WorkStarted;
			}
		}
	}
	return worked;
}

function getDifferenceInDays(date1, date2) {
	const diffInMilliseconds = Math.abs(date1 - date2);
	const daysDifference = Math.floor(diffInMilliseconds / (24 * 60 * 60 * 1000));
	return daysDifference;
}

function calculateWorked7(newDays, days) {
	let worked7 = 0;
	const limit = new Date();
	limit.setDate(limit.getDate() - 8);
	limit.setHours(0);
	limit.setMinutes(0);
	let count = 0;
	let flag = true;
	while (flag) {
		if (days[count]) {
			if (new Date(days[count].date) > limit) {
				worked7 += days[count].worked;
				count++;
			} else {
				flag = false;
			}
		} else {
			flag = false;
		}
	}

	worked7 += newDays[0].worked;

	return worked7;
}
