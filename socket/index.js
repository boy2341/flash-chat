const activeUsers = require("./activeUsers");
const authSocket = require("./authSocket");

const privateChatSocket = require("./privateChatSocket");
const strangerSocket = require("./strangerSocket");
const chatroomSocket = require("./chatroomSocket");
const friendsSocket = require("./friendsSocket");
const Message = require("../models/Message");
module.exports = function (io) {

    authSocket(io);

    io.on("connection", (socket) => {

        console.log(`${socket.username} connected`);

        activeUsers.set(socket.username, socket.id);

        io.emit(
            "update_user_list",
            [...activeUsers.keys()]
        );
        privateChatSocket(io, socket);
        strangerSocket(io, socket);
        chatroomSocket(io, socket);
        friendsSocket(io, socket);

        socket.on("disconnect", () => {

            activeUsers.delete(socket.username);

            io.emit(
                "update_user_list",
                [...activeUsers.keys()]
            );
            console.log(`${socket.username} disconnected`);

        });

    });

}