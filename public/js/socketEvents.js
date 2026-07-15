function registerSocketEvents() {
    //private chat
    state.socket.on("private_room_ready", (roomId) => {
        state.currentRoomId = roomId;
        state.isPrivateMode = true;


        // roomId looks like "private-<userA>-<userB>" (sorted); pull out whichever
        // name isn't ours so the header shows who we're actually chatting with.
        const otherUser = roomId
            .replace("private-", "")
            .split("::")
            .find(name => name !== state.username);
        UIFunctions.changeRoomTitle(otherUser ? `Chat with ${otherUser}` : "Private Chat");
        UIFunctions.addSystemMessage("Private room connected");
    })
    state.socket.on("private_history", (messages) => {
        UIFunctions.clearMessages();
        messages.forEach(message => {
            UIFunctions.appendMessage({
                user: message.sender,
                text: message.text,
                time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });
        })
    })
    state.socket.on("chatrooms", (rooms) => {
        console.log("Rooms received:", rooms);
        renderCommunityCards(rooms);
    });
    state.socket.on("global_history", (messages) => {
        UIFunctions.clearMessages();
        messages.forEach(message => {
            UIFunctions.appendMessage({
                user: message.sender,
                text: message.text,
                time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });
        })
    })
    state.socket.on("connect", () => {
        UI.statusDot.classList.add("connected");
        state.socket.emit("register_user");
        state.socket.emit("get_chatrooms");
        UIFunctions.addSystemMessage(`Verified profile identity: ${state.username}`);
    });
    state.socket.on("user_joined", (msg) => {
        UIFunctions.addSystemMessage(msg);
    });
    state.socket.on("user_left", (msg) => {
        UIFunctions.addSystemMessage(msg);
    });
    state.socket.on("receive_message", (data) => {
        UIFunctions.appendMessage(data);
    });
    state.socket.on("new_friend_request", (data) => {
        loadFriendRequests();
    });
    state.socket.on("friend_request_accept", (data) => {
        alert(`${data.username} accepted your friend request.`);
        loadFriends();
    });
    state.socket.on("friend_request_reject", (data) => {
        alert(`${data.username} rejected your friend request.`);
    });
    state.socket.on("receive_stranger_message",
        UIFunctions.appendMessage
    );
    state.socket.on("waiting_for_stranger", () => {
        UIFunctions.clearMessages();
        UIFunctions.changeRoomTitle("Searching...");
        UIFunctions.addSystemMessage("Waiting for another user...");
    });
    state.socket.on("stranger_connected", () => {
        state.strangerMode = true;
        state.isPrivateMode = false;
        UIFunctions.clearMessages();
        UIFunctions.changeRoomTitle(state.currentInterest ? `Anonymous (${state.currentInterest})` : "Anonymous Stranger");
        showStrangerControls();
        UIFunctions.addSystemMessage("Connected to a stranger.");
    });
    state.socket.on("stranger_left", () => {

        state.strangerMode = false;

        UI.leaveStrangerBtn.style.display = "none";
        UI.skipStrangerBtn.style.display = "none";
        UIFunctions.changeRoomTitle("FlashChat");
        UIFunctions.addSystemMessage(
            "The stranger disconnected."
        );
    });
    state.socket.on("stranger_skipped", () => {
        state.strangerMode = false;
        UIFunctions.clearMessages();
        UIFunctions.changeRoomTitle("Searching...");
        UIFunctions.addSystemMessage("Stranger skipped. Finding another...");
        UI.leaveStrangerBtn.style.display = "none";
        UI.skipStrangerBtn.style.display = "none"
    });
    state.socket.on("chatroom_joined", room => {
        console.log("Joined chat room:", room);
        UIFunctions.clearMessages();
        UIFunctions.changeRoomTitle(room);
        UIFunctions.addSystemMessage(`Joined ${room}`);
    });
    state.socket.on("receive_chatroom_message",
        UIFunctions.appendMessage
    );
    state.socket.on("chatroom_notification",
        data => {
            UIFunctions.addSystemMessage(data.message);
        }
    );
    state.socket.on("disconnect", () => {
        UI.statusDot.classList.remove('connected');
        UIFunctions.addSystemMessage("Disconnected from live stream.");
    });

    state.socket.on("update_user_list", usersArray => {

        renderOnlineUsers(usersArray);

    });
    state.socket.on("receive_private_message", (data) => {
        console.log("Private message:", data);
        UIFunctions.appendMessage(data);
    });
}