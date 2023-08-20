import db from "../db/conn.mjs";

async function setupChangeStream(io) {
	const usersCollection = db.collection("users");

	// Specify the criteria for the change stream
	const pipeline = [
		{
			$match: {
				$and: [
					{ operationType: "update" },
					{ "updateDescription.updatedFields.currentDay": { $exists: true } },
				],
			},
		},
		{
			$project: {
				"updateDescription.updatedFields.currentDay": 1,
				"fullDocument.team": 1,
				"fullDocument._id": 1,
			},
		},
	];

	const changeStream = usersCollection.watch(pipeline, { fullDocument: "updateLookup" });

	changeStream.on("change", (change) => {
		// Check if user has a team
		if (change.fullDocument.team == null) return false;
		console.log("Change occurred");
		// emit signal
		const teamId = change.fullDocument.team.toString();
		io.emit(teamId, {
			from: change.fullDocument._id,
			currentDay: change.updateDescription.updatedFields.currentDay,
		});
	});

	// Keep the process running to continue listening for changes
	await new Promise(() => {});
}

export default setupChangeStream;
