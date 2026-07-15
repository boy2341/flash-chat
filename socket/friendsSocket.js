const User = require("../models/User");
const activeUsers = require("./activeUsers");
module.exports = function (io, socket) {
    socket.on("register_user", () => {
        activeUsers.set(socket.username, socket.id);
    });
    socket.on("friend_request_sent", async (data) => {
        try {
            const receiver = await User.findOne({
                username: data.receiverUsername
            });
            if (!receiver)
                return;
            const receiverSocket = activeUsers.get(data.receiverUsername);
            if (receiverSocket) {
                io.to(receiverSocket).emit("new_friend_request", { sender: data.senderUsername });
            }
        } catch (err) { console.log(err); }
    });
    socket.on("friend_request_accepted", (data) => {
        const senderSocket = activeUsers.get(data.senderUsername);
        if (senderSocket) { io.to(senderSocket).emit("friend_request_accept", { username: data.receiverUsername }); }

    });

    socket.on("friend_request_rejected", (data) => {
        const senderSocket = activeUsers.get(data.senderUsername);
        if (senderSocket) {
            io.to(senderSocket).emit("friend_request_reject", {
                username: data.receiverUsername
            });
        }
    });
};