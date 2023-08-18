import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/loading.jsx";
import { MyContext } from "../contexts/MyContextProvider.jsx";
import SideDrawer from "../components/sideDrawer.jsx";
import NavBar from "../components/navbar.jsx";
import Timeline from "../components/timeline.jsx";
import DashboardUI from "../components/dashboardUI.jsx";
import Waffle from "../components/waffle.jsx";
import ScheduleUI from "../components/scheduleUI.jsx";
import LeaveUI from "../components/leaveUI.jsx";
import Popup from "../components/popup.jsx";
import useUserReducer from "../reducers/useUserReducer.jsx";
import useCurrentDayReducer from "../reducers/useCurrentDayReducer.jsx";
import useScheduleReducer from "../reducers/useScheduleReducer.jsx";
import { updateDB, getUserFromDB } from "../fetch/serverRequests.jsx";
import NoTeamUI from "../components/noTeamUI.jsx";
import HasTeamUI from "../components/hasTeamUI.jsx";

export default function Home() {
	const navigate = useNavigate();
	const { token, updateToken } = useContext(MyContext);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false); // {message: 'error', redirect: false}
	const [openSideDrawer, setOpenSideDrawer] = useState(false);

	const [currentTab, setCurrentTab] = useState(
		localStorage.getItem("tab") ? localStorage.getItem("tab") : "home"
	);
	const [user, userDispatch] = useUserReducer();
	const [currentDay, currentDayDispatch] = useCurrentDayReducer();
	const [status, setStatus] = useState();
	const [schedule, scheduleDispatch] = useScheduleReducer();
	const [team, setTeam] = useState();

	useEffect(() => {
		console.log("token:", token.slice(0, 20));

		if (!token) {
			navigate("/login");
			return () => {};
		}
		// Get user data
		setIsLoading(true);
		getUserFromDB(token, "user")
			.then((data) => {
				userDispatch({
					type: "init",
					user: data.user,
				});
				currentDayDispatch({
					type: "init",
					currentDay: data.currentDay,
				});
				scheduleDispatch({
					type: "init",
					schedule: data.schedule,
				});
				if (data.team) {
					setTeam(data.team);
				}
			})
			.catch((err) => {
				setError({ message: err.message, redirect: true });
			})
			.finally(() => setIsLoading(false));
	}, []);

	useEffect(() => {
		if (!currentDay) {
			return () => {};
		}
		const payload = {
			currentDay: currentDay,
		};
		setStatus(calculateCurrentEvent(currentDay));
		updateDB(token, "currentDay", payload).then((value) => {
			console.log(value);
		});
	}, [currentDay]);

	useEffect(() => {
		if (!schedule) {
			return () => {};
		}
		const payload = {
			schedule: schedule,
		};
		updateDB(token, "schedule", payload).then((value) => {
			console.log(value);
		});
	}, [schedule]);

	useEffect(() => {
		if (!user || !user.team) {
			return () => {};
		}
		console.log("User updated");
		const payload = {
			team: user.team,
		};
		updateDB(token, "user", payload).then((value) => {
			console.log(value);
		});
	}, [user]);

	return isLoading ? (
		<Loading />
	) : (
		<div className="flex flex-col items-center justify-center h-screen bg-black ">
			<SideDrawer openSideDrawer={openSideDrawer} setOpenSideDrawer={setOpenSideDrawer} />
			{user && (
				<NavBar
					user={user}
					openSideDrawer={openSideDrawer}
					setOpenSideDrawer={setOpenSideDrawer}
					currentTab={currentTab}
					setCurrentTab={setCurrentTab}
				/>
			)}
			{currentTab === "home" && (
				<section className="animate-fadeIn duration-200 flex flex-col items-center h-[calc(100vh-80px)] w-screen px-5 min-w-[350px] max-w-7xl">
					<div className="flex justify-center flex-1 w-full p-2 m-2 space-y-5 rounded-xl bg-grey">
						{user && (
							<DashboardUI
								user={user}
								currentDay={currentDay}
								currentDayDispatch={currentDayDispatch}
								status={status}
								setStatus={setStatus}
							/>
						)}
					</div>
					<div className="w-full p-2 m-2 border rounded-lg h-1/3 border-grey">
						{user && <Timeline day={currentDay} />}
					</div>
					<div className="w-full m-2 border rounded-lg h-1/3 border-grey">
						{user && <Waffle user={user} />}
					</div>
				</section>
			)}
			{currentTab === "schedule" && (
				<section className="animate-fadeIn duration-200 flex md:flex-row flex-col  justify-center items-center h-[calc(100vh-80px)] w-screen px-5 min-w-[350px] max-w-7xl">
					<div className="w-full p-2 m-4 rounded-lg md:w-1/2 h-2/3 bg-grey">
						{user && <ScheduleUI schedule={schedule} scheduleDispatch={scheduleDispatch} />}
					</div>
					<div className="w-full p-2 m-4 rounded-lg md:w-1/2 h-2/3 bg-grey">
						{user && <LeaveUI schedule={schedule} scheduleDispatch={scheduleDispatch} />}
					</div>
				</section>
			)}
			{currentTab === "teams" && (
				<section className="animate-fadeIn duration-200 flex flex-col items-center justify-center h-[calc(100vh-80px)] w-screen px-5 min-w-[350px] max-w-7xl">
					{user && !user.team && (
						<div className="w-full p-2 m-4 rounded-lg md:w-1/2 h-2/3 bg-grey">
							<NoTeamUI setError={setError} user={user} userDispatch={userDispatch} />
						</div>
					)}
					{user && user.team && (
						<div className="flex justify-center flex-1 w-full py-2 my-2 space-y-5 rounded-xl bg-grey">
							<HasTeamUI
								setError={setError}
								user={user}
								userDispatch={userDispatch}
								team={team}
								setTeam={setTeam}
							/>
						</div>
					)}
				</section>
			)}
			<Popup error={error} setError={setError} updateToken={updateToken} />
		</div>
	);
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
