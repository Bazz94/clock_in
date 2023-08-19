import { useState, useContext } from "react";
import { updateDb_teams } from "../fetch/serverRequests";
import { MyContext } from "../contexts/MyContextProvider.jsx";

const MODE = {
	join: "join",
	create: "create",
};

const NoTeamUI = ({ setError, userDispatch }) => {
	const { token } = useContext(MyContext);
	const [mode, setMode] = useState(MODE.join);
	const [name, setName] = useState("");
	const [inputError, setInputError] = useState(false);
	const [code, setCode] = useState("");

	function handleJoin() {
		if (code.length < 1) {
			setInputError(true);
			return false;
		}
		const payload = {
			code: code,
		};
		updateDb_teams(token, "join", payload)
			.then((_teamID) => {
				userDispatch({
					type: "set",
					team: _teamID,
				});
			})
			.catch((err) => {
				console.log(err);
				setError({ message: err });
			});
	}

	function handleGoToCreate() {
		setMode(MODE.create);
	}

	function handleCreateTeam() {
		if (name.length < 1) {
			setInputError(true);
			return false;
		}
		const payload = {
			teamName: name,
		};
		updateDb_teams(token, "create", payload)
			.then((_teamID) => {
				console.log("team created: ", _teamID);
				userDispatch({
					type: "set",
					team: _teamID,
				});
			})
			.catch((err) => {
				console.log(err);
				setError({ message: err });
			});
	}

	function handleCancel() {
		setMode(MODE.join);
		setInputError(false);
		setCode("");
		setName("");
	}

	return (
		<div className="flex flex-col items-center h-full">
			<h2 className="flex items-center m-2 text-2xl h-1/6">Teams</h2>
			{mode === MODE.join && (
				<div className="flex flex-col items-center justify-center p-2 duration-200 h-4/6 animate-fadeIn">
					<input
						className={`w-48 m-2 text-center text-black rounded-md h-7
              ${inputError && "border-2 border-red"}`}
						type="text"
						placeholder="Enter team code..."
						value={code}
						onChange={(e) => {
							setInputError(false);
							setCode(e.target.value);
						}}
					/>
					<button
						className="w-20 p-2 m-2 text-black rounded-lg bg-green text-md hover:scale-105"
						onClick={handleJoin}
					>
						Join
					</button>
					<p className="opacity-70">or</p>
					<button
						className="w-20 p-2 m-2 rounded-lg bg-red text-md hover:scale-105"
						onClick={handleGoToCreate}
					>
						Create
					</button>
				</div>
			)}
			{mode === MODE.create && (
				<div className="flex flex-col items-center justify-center p-2 duration-200 h-4/6 animate-fadeIn">
					<p className="w-48 text-left h-7">Team name</p>
					<input
						className={`w-48 m-2 text-center text-black rounded-md h-7
              ${inputError && "border-2 border-red"}`}
						type="text"
						placeholder="Enter a team name..."
						value={name}
						onChange={(e) => {
							setName(e.target.value);
						}}
					/>
					<button
						className="w-20 p-2 m-2 rounded-lg bg-red text-md hover:scale-105"
						onClick={handleCreateTeam}
					>
						Create
					</button>
					<button
						className="w-20 p-2 m-2 text-md hover:underline hover:scale-105"
						onClick={handleCancel}
					>
						Cancel
					</button>
				</div>
			)}
		</div>
	);
};

export default NoTeamUI;
