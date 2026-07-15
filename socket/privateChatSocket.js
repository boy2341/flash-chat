const activeUsers = require("./activeUsers");
const Message = require("../models/Message");
module.exports = function (io, socket) {
    activeUsers.set(socket.username, socket.id)
    io.emit("update_online_users", [...activeUsers.keys()]
    );
    socket.on("join_private_chat", (targetUser) => {
        const roomId = `private-${[socket.username, targetUser].sort().join("::")}`;
        socket.join(roomId);

        const targetSocketId = activeUsers.get(targetUser);

        if (targetSocketId) {

            const targetSocket = io.sockets.sockets.get(targetSocketId);

            if (targetSocket) {

                targetSocket.join(roomId);
                targetSocket.emit("private_room_ready", roomId
                );
            }
        }
        socket.emit("private_room_ready", roomId);

    });
    socket.on("send_private_message", (data) => {
        data.user = socket.username;
        io.to(data.room).emit("receive_private_message", data);
    });
    socket.on("leave_private_room", () => {
        socket.rooms.forEach(room => {
            if (room.startsWith("private-")) {

                socket.leave(room);

            }

        });

    });
    socket.on("typing", (roomId) => {
        socket.to(roomId).emit("friend_typing", socket.username);

    });
    socket.on("stop_typing", (roomId) => {
        socket.to(roomId).emit("friend_stop_typing", socket.username);
    });
    socket.on("disconnect", () => {
        activeUsers.delete(socket.username);
        io.emit("update_online_users", [...activeUsers.keys()]);
    });
};
