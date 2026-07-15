const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
module.exports = function (io, socket) {
    socket.on("get_chatrooms", async () => {
        try {
            const rooms = await ChatRoom.find().sort({ name: 1 });
            const roomsWithCounts = rooms.map(room => {
                const roomObj = room.toObject();
                const socketRoom = io.sockets.adapter.rooms.get(room.name);
                roomObj.onlineUsers = socketRoom ? socketRoom.size : 0;
                return roomObj;
            });
            console.log("Sending chat rooms:", roomsWithCounts.length);
            socket.emit("chatrooms", roomsWithCounts);
        } catch (err) {
            console.error("Error loading chat rooms:", err);
            socket.emit("chatrooms", []);
        }
    });
    socket.on("join_chatroom", (roomName) => {
        if (socket.currentChatRoom) {
            socket.leave(socket.currentChatRoom);
            socket.to(socket.currentChatRoom).emit(
                "chatroom_notification",
                {
                    message: `${socket.username} left the room.`
                });
        }
        console.log(`${socket.username} joined ${roomName}`);
        socket.join(roomName);
        socket.currentChatRoom = roomName;
        socket.emit("chatroom_joined", roomName);
        socket.to(roomName).emit(
            "chatroom_notification",
            {
                message: `${socket.username} joined the room.`
            });
    });
    socket.on("leave_chatroom", () => {
        if (!socket.currentChatRoom)
            return;
        socket.to(socket.currentChatRoom).emit(
            "chatroom_notification", { message: `${socket.username} left the room.` });
        socket.leave(socket.currentChatRoom);
        socket.currentChatRoom = null;
    });
    socket.on("send_chatroom_message", (data) => {
        if (!socket.currentChatRoom)
            return;
        io.to(socket.currentChatRoom).emit(
            "receive_chatroom_message",
            {
                user: socket.username,
                text: data.text,
                time: Date.now()
            });
    });

};