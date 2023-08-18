import config from "../config/config";

export async function getUserFromDB(token, route) {
	const requestOptions = {
		method: "GET",
		headers: {
			authorization: `Bearer ${token}`,
		},
	};

	return new Promise((res, rej) => {
		fetch(`${config.apiUrl}/${route}`, requestOptions)
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				if (res.status === 500) {
					throw Error("Server error");
				}
				throw Error("Failed to connect to server");
			})
			.then((data) => {
				res(data);
			})
			.catch((err) => {
				rej(err.message);
			});
	});
}

export function updateDB(token, route, update) {
	const requestOptions = {
		method: "PATCH",
		headers: {
			"Content-type": "application/json",
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(update),
	};

	return new Promise((res, rej) => {
		fetch(`${config.apiUrl}/${route}`, requestOptions)
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				if (res.status === 500) {
					throw Error("Server error");
				}
				throw Error("Failed to connect to server");
			})
			.then((data) => {
				// Login and navigate to Home page
				res(data);
			})
			.catch((err) => {
				rej(err.message);
			});
	});
}

export function updateDb_teams(token, route, data) {
	const requestType = route === "create" ? "POST" : "PATCH";
	const requestOptions = {
		method: requestType,
		headers: {
			"Content-type": "application/json",
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(data),
	};
	return new Promise((res, rej) => {
		fetch(`${config.apiUrl}/teams/${route}`, requestOptions)
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				if (res.status === 500) {
					throw Error("Server error");
				}
				if (res.status === 404) {
					throw Error("Invalid invite code");
				}
				throw Error("Failed to connect to server");
			})
			.then((data) => {
				res(data);
			})
			.catch((err) => {
				rej(err.message);
			});
	});
}
