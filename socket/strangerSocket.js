const waitingUsers = [];
const interestQueues = new Map();
const Message = require("../models/Message");

function addToInterestQueue(socket, interest) {
    if (!interestQueues.has(interest)) {
        interestQueues.set(interest, []);

    }
    const queue = interestQueues.get(interest);
    if (!queue.includes(socket)) {
        queue.push(socket);
    }
}
function removeFromQueues(socket) {

    let index = waitingUsers.indexOf(socket);

    if (index !== -1) {
        waitingUsers.splice(index, 1);
    }

    for (const queue of interestQueues.values()) {
        index = queue.indexOf(socket);

        if (index !== -1) {
            queue.splice(index, 1);
        }
    }
}

function attemptMatch() {

    while (waitingUsers.length >= 2) {

        const user1 = waitingUsers.shift();
        const user2 = waitingUsers.shift();

        if (!user1 || !user2)
            return;

        const room =
            "stranger_" + Date.now() + "_" + Math.random();

        user1.join(room);
        user2.join(room);

        user1.strangerRoom = room;
        user2.strangerRoom = room;

        user1.partnerId = user2.id;
        user2.partnerId = user1.id;

        user1.emit("stranger_connected");
        user2.emit("stranger_connected");

    }

}
function attemptInterestMatch(interest) {

    if (!interestQueues.has(interest))
        return;

    const queue = interestQueues.get(interest);

    while (queue.length >= 2) {

        const user1 = queue.shift();

        const user2 = queue.shift();

        const room =
            "interest_" + Date.now() + "_" + Math.random();

        user1.join(room);
        user2.join(room);

        user1.strangerRoom = room;
        user2.strangerRoom = room;

        user1.partnerId = user2.id;
        user2.partnerId = user1.id;

        user1.emit("stranger_connected");

        user2.emit("stranger_connected");

    }

}

module.exports = function (io, socket) {
    socket.on("find_stranger", (interest) => {

        removeFromQueues(socket);

        socket.currentInterest = interest;

        if (interest && interest.trim() !== "") {

            addToInterestQueue(socket, interest);

            attemptInterestMatch(interest);

        } else {

            waitingUsers.push(socket);

            attemptMatch();
        }

        if (!socket.strangerRoom) {

            socket.emit("waiting_for_stranger");
        }
    });
    socket.on("send_stranger_message", async (data) => {

        if (!socket.strangerRoom) return;

        try {

            await Message.create({

                type: "stranger",

                room: socket.strangerRoom,

                sender: socket.username,

                text: data.text

            });

            io.to(socket.strangerRoom).emit(

                "receive_stranger_message",

                {

                    user: socket.username,

                    text: data.text,

                    time: Date.now()

                }

            );

        } catch (err) {

            console.error(err);

            socket.emit(
                "system_message",
                "Unable to send stranger message."
            );
        }
    });
    socket.on("leave_stranger", () => {

        if (!socket.strangerRoom) return;

        const room = socket.strangerRoom;

        const partner =
            io.sockets.sockets.get(socket.partnerId);

        socket.leave(room);

        socket.strangerRoom = null;

        socket.partnerId = null;

        if (partner) {

            partner.leave(room);

            partner.strangerRoom = null;

            partner.partnerId = null;

            partner.emit("stranger_left");
        }

        socket.emit("stranger_left");
    });
    socket.on("skip_stranger", () => {

        if (!socket.strangerRoom) return;

        const room = socket.strangerRoom;

        const partner =
            io.sockets.sockets.get(socket.partnerId);

        socket.leave(room);

        socket.strangerRoom = null;

        socket.partnerId = null;

        socket.emit("waiting_for_stranger");

        waitingUsers.push(socket);

        attemptMatch();

        if (partner) {

            partner.leave(room);

            partner.strangerRoom = null;

            partner.partnerId = null;

            partner.emit("stranger_skipped");

            waitingUsers.push(partner);

            attemptMatch();
        }
    });
    socket.on("disconnect", () => {

        removeFromQueues(socket);

        if (!socket.strangerRoom) return;

        const partner =
            io.sockets.sockets.get(socket.partnerId);

        if (partner) {

            partner.leave(socket.strangerRoom);

            partner.strangerRoom = null;

            partner.partnerId = null;

            partner.emit("stranger_left");
        }
    });
}