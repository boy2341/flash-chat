window.addEventListener("DOMContentLoaded", () => {
    try {
        const token = localStorage.getItem("chat_token");
        const username = localStorage.getItem("chat_username");
        if (!token || !username) {
            window.location.href = "/views/login.html";
            return;
        }
        state.authToken = token;
        state.username = username;
        connectToSecureSocket();
        initializeFriends();
        initializeChatRooms();
        initializeStranger();
        const params = new URLSearchParams(window.location.search);
        const dmTarget = params.get("dm");
        const strangerMode = params.get("stranger") === "true";
        if (dmTarget) {
            state.pendingDmTarget = dmTarget;
        } else if (strangerMode) {
            state.pendingStrangerMode = true;
        } else if (roomTarget) {
            state.pendingRoomTarget = roomTarget;
        }
    } catch (err) {
        console.error("Initialization Error:", err);
        localStorage.removeItem("chat_token");
        localStorage.removeItem("chat_username");
        window.location.href = "/views/login.html";
    }
});
function connectToSecureSocket() {
    UIFunctions.addSystemMessage("Connecting...");
    state.socket = io("http://localhost:3002", {
        auth: { token: state.authToken }
    });
    state.socket.on("connect", () => {
        console.log("Connected");
        UIFunctions.addSystemMessage("Connected successfully.");
        registerSocketEvents();
        if (state.pendingDmTarget) {
            state.socket.emit("join_private_chat", state.pendingDmTarget);
            state.pendingDmTarget = null;
        } else if (state.pendingStrangerMode) {
            state.strangerMode = true;
            state.chatRoomMode = false;
            state.isPrivateMode = false;
            const interestSelect = document.getElementById("interestSelect");
            state.currentInterest = interestSelect ? interestSelect.value : "";
            UIFunctions.changeRoomTitle("Searching...");
            state.socket.emit("find_stranger", state.currentInterest);
            state.pendingStrangerMode = false;
        } else if (state.pendingRoomTarget) {
            state.chatRoomMode = true;
            state.currentChatRoom = state.pendingRoomTarget;
            state.socket.emit("join_chatroom", state.pendingRoomTarget);
            state.pendingRoomTarget = null;
        }

    });

    state.socket.on("connect_error", (err) => {

        console.error(err.message);

        if (
            err.message === "TokenExpired" ||
            err.message === "Authentication Failure"
        ) {

            localStorage.removeItem("chat_token");
            localStorage.removeItem("chat_username");

            alert("Your session has expired. Please login again.");

            window.location.href = "/views/login.html";

            return;
        }

        UIFunctions.addSystemMessage("Unable to connect to server.");

    });

}

/* ===========================================
   SEND MESSAGE
=========================================== */

UI.sendBtn.addEventListener("click", triggerMessageSend);

UI.messageInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        triggerMessageSend();

    }

});

function triggerMessageSend() {

    if (!state.socket || !state.socket.connected) {

        UIFunctions.addSystemMessage("Not connected to server.");

        return;

    }

    const text = UI.messageInput.value.trim();

    if (!text) return;

    const messageData = {

        text,

        room: state.currentRoomId,

        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })

    };

    if (state.chatRoomMode) {

        state.socket.emit(
            "send_chatroom_message",
            messageData
        );

    }

    else if (state.strangerMode) {

        state.socket.emit(
            "send_stranger_message",
            messageData
        );

    }

    else if (state.isPrivateMode) {

        state.socket.emit(
            "send_private_message",
            messageData
        );

    }

    UI.messageInput.value = "";

}

/* ===========================================
   DASHBOARD CHAT FUNCTIONS
=========================================== */

window.joinChatRoom = function (roomName) {

    if (!state.socket || !state.socket.connected) {

        UIFunctions.addSystemMessage("Not connected.");

        return;

    }

    state.chatRoomMode = true;
    state.strangerMode = false;
    state.isPrivateMode = false;

    state.currentRoomId = roomName;

    UI.messagesBox.innerHTML = "";

    UIFunctions.changeRoomTitle(roomName);

    state.socket.emit("join_chatroom", roomName);

    document
        .getElementById("chatSection")
        .scrollIntoView({
            behavior: "smooth"
        });

};

window.startStrangerChat = function () {

    if (!state.socket || !state.socket.connected) {

        UIFunctions.addSystemMessage("Not connected.");

        return;

    }

    state.chatRoomMode = false;
    state.strangerMode = true;
    state.isPrivateMode = false;

    const interestSelect =
        document.getElementById("interestSelect");

    state.currentInterest =
        interestSelect ?
            interestSelect.value :
            "";

    UI.messagesBox.innerHTML = "";

    UIFunctions.changeRoomTitle("Searching...");

    state.socket.emit(
        "find_stranger",
        state.currentInterest
    );

    document
        .getElementById("chatSection")
        .scrollIntoView({
            behavior: "smooth"
        });

};