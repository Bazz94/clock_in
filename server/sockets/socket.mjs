import { Server } from "socket.io";

function connectSocket(server) {
	const io = new Server(server, {
		cors: {
			origin: "*",
		},
	});

	io.on("connection", (socket) => {
		console.log("A user connected");

		// You can add your event listeners and handlers here
		socket.on("disconnect", () => {
			console.log("User disconnected");
		});
	});

	return io;
}

export default connectSocket;
