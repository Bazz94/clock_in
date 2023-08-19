import { useEffect, useRef, useState, useContext } from "react";
import { MyContext } from "../contexts/MyContextProvider.jsx";
import Waffle from "../components/waffle.jsx";
import { updateDb_teams, getDb_teams } from "../fetch/serverRequests.jsx";

const HasTeamUI = ({ setError, user, userDispatch }) => {
	const { token } = useContext(MyContext);
	const [team, setTeam] = useState();
	const [teamMembers, setTeamMembers] = useState([]);
	const codeExpires = useRef();
	const getIsBusy = useRef(false);

	useEffect(() => {
		if (team || !user.team || getIsBusy.current) return () => {};
		console.log(team, user.team);
		getDb_teams(token)
			.then((data) => {
				console.log("Got team data");
				codeExpires.current = new Date(data.team.codeExpires);
				console.log(data.members);
				setTeam(data.team);
				setTeamMembers(data.members);
				getIsBusy.current = false;
			})
			.catch((err) => {
				console.log(err);
				setError({ message: err });
				getIsBusy.current = false;
			});
		getIsBusy.current = true;
	}, [team]);

	function handleCreateInvite() {
		const payload = {
			expire: 3,
		};
		updateDb_teams(token, "invite", payload)
			.then((data) => {
				console.log("Created invite code");
				setTeam({ ...team, code: data.code, codeExpires: data.codeExpires });
				codeExpires.current = new Date(data.codeExpires);
			})
			.catch((err) => {
				console.log(err);
				setError({ message: err });
			});
	}

	function handleLeaveTeam() {
		// TODO: confirmation prompt
		const payload = {
			team_id: team._id,
		};
		updateDb_teams(token, "leave", payload)
			.then((data) => {
				console.log(data);
				userDispatch({
					type: "set",
					team: null,
				});
				setTeam(null);
			})
			.catch((err) => {
				console.log(err);
				setError({ message: err });
			});
	}

	const now = new Date();
	if (!team) return <div></div>;
	return (
		<div className="flex flex-col items-center w-full h-full">
			<div className="flex items-center justify-center w-full h-28">
				<div className="flex justify-start w-1/3">
					<button
						className="p-2 m-2 text-green text-md hover:underline hover:scale-105"
						onClick={handleCreateInvite}
						hidden={user._id !== team.admin}
					>
						New Invite
					</button>
					{user._id === team.admin && (
						<p className="p-2 my-2 opacity-50">
							{team.code && codeExpires.current > now ? team.code : "none"}
						</p>
					)}
				</div>
				<h2 className="flex items-center justify-center w-1/3 m-2 text-2xl text-center h-28">
					{team.name}
				</h2>
				<div className="flex justify-end w-1/3">
					<button
						className="p-2 m-2 text-red text-md hover:underline hover:scale-105"
						onClick={handleLeaveTeam} //#4F4BU
					>
						Leave Team
					</button>
				</div>
			</div>
			<div className="flex w-full p-2 py-3 opacity-50">
				<span className="w-1/6 px-2">Name</span>
				<div className="flex w-4/6 justify-evenly">
					<span className="flex justify-center w-32 px-2">Status</span>
					<span className="flex justify-center w-32 px-2">Today</span>
					<span className="flex justify-center w-32 px-2">Last 7</span>
				</div>
			</div>
			<div className="flex flex-col items-center flex-1 w-full">
				{teamMembers.map((value, index) => (
					<Accordion key={index} member={value} />
				))}
			</div>
		</div>
	);
};

export default HasTeamUI;

const Accordion = ({ member }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleAccordion = () => {
		setIsOpen(!isOpen);
	};
	return (
		<div className="flex flex-col w-full border-t border-white border-opacity-10 border-x last:border-b hover:bg-opacity-20 hover:bg-black">
			<div className="flex w-full p-2 py-3" onClick={toggleAccordion}>
				<span className="w-1/6 px-2 ">{member.name}</span>
				<div className="flex w-4/6 justify-evenly">
					<span className="flex justify-center w-32 px-2 ">
						{calculateCurrentEvent(member.currentDay)}
					</span>
					<span className="flex justify-center w-32 px-2">
						{mSecondsDateToString(member.currentDay.worked)}
					</span>
					<span className="flex justify-center w-32 px-2">
						{mSecondsDateToString(member.worked7)}
					</span>
				</div>
				<div className="flex justify-end w-1/6 px-2">
					{isOpen && (
						<span className="duration-100 animate-fadeIn">
							<ChevronUpIcon />
						</span>
					)}
					{!isOpen && (
						<span className="duration-100 animate-fadeIn">
							<ChevronDownIcon />
						</span>
					)}
				</div>
			</div>
			<div
				className={`w-full  bg-black overflow-hidden transition-all duration-500 
          ${isOpen ? " h-[250px] " : " h-0 "}`}
			>
				<div className={`w-full h-[290px] -translate-y-6`}>
					<Waffle user={member} />
				</div>
			</div>
		</div>
	);
};

const ChevronUpIcon = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="w-6 h-6"
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
		</svg>
	);
};

const ChevronDownIcon = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="w-6 h-6"
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
		</svg>
	);
};

function mSecondsDateToString(milliseconds) {
	const date = new Date(milliseconds);
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const formattedHours = hours < 10 ? `0${hours}` : hours;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	const formattedTime = `${formattedHours}:${formattedMinutes}`;
	return formattedTime;
}

function calculateCurrentEvent(currentDay) {
	let result = "none";
	const currentTime = 20;
	if (
		currentDay.workStarts.length !== 0 &&
		!currentDay.clockedIn.length !== 0 &&
		currentTime > currentDay.workStarts[0]
	) {
		// set day status to late
		return currentDay.workStarts[0] - currentTime + " late";
	}

	for (let i = 0; i < currentDay.clockedIn.length; i++) {
		if (currentDay.startedBreak[i] && !currentDay.endedBreak[i]) {
			return "break";
		}
		if (currentDay.clockedIn[i] && !currentDay.clockedOut[i]) {
			return "working";
		}
		if (currentDay.clockedIn[i] && currentDay.clockedOut[i]) {
			result = "done";
		}
	}
	return result;
}
