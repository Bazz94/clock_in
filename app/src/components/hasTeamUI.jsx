import { useEffect, useRef, useState, useContext } from "react";
import { MyContext } from "../contexts/MyContextProvider.jsx";
import TeamsPopup from "./teamPopup";
import Waffle from "../components/waffle.jsx";

const HasTeamUI = ({ setError, user, userDispatch, team, setTeam }) => {
	const { token, updateToken } = useContext(MyContext);
	const [code, setCode] = useState("");

	function handleCreateInvite() {
		console.log("invite button pressed");
	}

	function handleLeaveTeam() {}

	return (
		<div className="flex flex-col items-center w-full h-full">
			<div className="flex items-center justify-center w-full h-28">
				<div className="flex justify-start w-1/3">
					<button
						className="p-2 m-2 text-green text-md hover:underline hover:scale-105"
						onClick={handleCreateInvite}
						hidden={user._id !== team.admin}
					>
						Invite Code
					</button>
				</div>
				<h2 className="flex items-center justify-center w-1/3 m-2 text-2xl text-center h-28">
					{team.name}
				</h2>
				<div className="flex justify-end w-1/3">
					<button
						className="p-2 m-2 text-red text-md hover:underline hover:scale-105"
						onClick={handleLeaveTeam}
					>
						Leave Team
					</button>
				</div>
			</div>
			<div className="flex flex-col items-center flex-1 w-full py-2">
				{members.map((value, index) => (
					<Accordion key={index} member={user} />
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
		<div className="flex flex-col w-full border-t border-white border-opacity-10 border-x last:border-b">
			<div className="flex p-2 m-2" onClick={toggleAccordion}>
				<span>{member.name}</span>
				<span className="mx-4">{isOpen ? "▲" : "▼"}</span>
			</div>
			<div
				className={`w-full  bg-black overflow-hidden transition-all duration-500
          ${isOpen ? " h-[290px] " : " h-0 "}`}
			>
				<div className={`w-full h-[290px]`}>
					<Waffle user={member} />
				</div>
			</div>
		</div>
	);
};
//
const members = [
	{
		name: "Jill",
		worked: new Date() + 1000 * 60 * 60 * 60,
	},
	{
		name: "Mike",
		worked: new Date() + 1000 * 60 * 60 * 60,
	},
];
