const usersListContainer = document.getElementById("usersListContainer");
const friendsListContainer = document.getElementById("friendsListContainer");
const friendSearchInput = document.getElementById("friendSearchInput");
const friendRequestsContainer = document.getElementById("friendRequestsContainer");
const addFriendBtn = document.getElementById("addFriendBtn");
async function loadFriends() {
    const response = await fetch(`/api/friends/${state.username}`);
    headers = { "Authorization": `Bearer ${state.authToken}` };
    const result = await response.json();
    if (result.success) {
        renderFriends(result.friends);
    }
}
async function loadFriendRequests() {
    const response = await fetch(`/api/friends/requests/${state.username}`);
    const result = await response.json();
    if (!result.success)
        return;
    renderFriendRequests(result.requests);
}
function renderFriends(friends) {
    friendsListContainer.innerHTML = "";
       friends.forEach(friend => {
        const btn = document.createElement("button");
        btn.textContent = friend.username;
        btn.onclick = () => {
            state.socket.emit(
                "join_private_chat",
                friend.username
            );
        };
        friendsListContainer.appendChild(btn);
    });
}
function renderFriendRequests(requests) {
    friendRequestsContainer.innerHTML = "";
    requests.forEach(request => {
        const card = document.createElement("div");
        card.style.background = "#2d2d2d";
        card.style.padding = "8px";
        card.style.borderRadius = "8px";
        card.innerHTML = `
<strong>${request.sender.username}</strong>
<br><br>
<button
class="acceptBtn"
                data-id="${request._id}">
                Accept
            </button>
<button class="rejectBtn" data-id="${request._id}">Reject </button>`;
        friendRequestsContainer.appendChild(card);
    });
}
function initializeFriends() {
    addFriendBtn.onclick = async () => {
        const receiverUsername = friendSearchInput.value.trim();
        if (!receiverUsername)
            return;
        const response = await fetch("/api/friends/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderUsername: state.username, receiverUsername })
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            state.socket.emit("friend_request_sent", { senderUsername: state.username, receiverUsername });
        }
        friendSearchInput.value = "";
    }

    findStrangerBtn.onclick = () => {
        state.strangerMode = true;
        state.socket.emit("find_stranger", interestSelect.value);
        UIFunctions.changeRoomTitle("Searching...");
    }
    skipStrangerBtn.onclick = () => {
        state.socket.emit("skip_stranger");
        state.strangerMode = false;
        UIFunctions.clearMessages();
        UIFunctions.changeRoomTitle("Searching...");
        UIFunctions.addSystemMessage("Looking for another stranger...");
        leaveStrangerBtn.style.display = "none";
        skipStrangerBtn.style.display = "none";
    };

    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("acceptBtn")) {
            const requestId = e.target.dataset.id;
            const response = await fetch("/api/friends/accept", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId })
            });
            const result = await response.json();
            if (result.success) {
                state.socket.emit("friend_request_accepted", { senderUsername: result.senderUsername, receiverUsername: state.username });
            }
            loadFriendRequests();
            loadFriends();
        }
    });
    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("rejectBtn")) {
            const requestId = e.target.dataset.id;
            const response = await fetch("/api/friends/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId }) });
            const result = await response.json();
            if (result.success) {
                state.socket.emit("friend_request_rejected", {
                    senderUsername: result.senderUsername,
                    receiverUsername: state.username
                });
            }
            loadFriendRequests();
        }
    });
}
function renderOnlineUsers(usersArray) {
    usersListContainer.innerHTML = ''; // Wipe list layout

    // 🔥 UPDATE USER COUNT BADGE:
    // usersArray contains everyone *else*, so its length is the total online user count!
    userCountBadge.textContent = usersArray.length;

    // Add a default back-to-global entry button
    const globalBtn = document.createElement('button');
    globalBtn.textContent = "Public Room";
    globalBtn.classList.add("button_add");
    UIFunctions.styleUserButton(globalBtn, false);
    globalBtn.onclick = () => switchToGlobalRoom();
    usersListContainer.appendChild(globalBtn);

    // Map and append remaining user connction targetse
    usersArray.forEach(onlineUser => {
        if (onlineUser === state.username) return; // Skip listing yourself

        const userBtn = document.createElement('button');
        userBtn.textContent = `👤 ${onlineUser}`;
        styleUserButton(
            userBtn,
            state.currentRoomId && state.currentRoomId.includes(onlineUser));

        userBtn.onclick = () => {
            console.log("Joining private chat with:", onlineUser);
            state.isPrivateMode = false;
            UIFunctions.changeRoomTitle(`Chat with ${onlineUser}`);
            UIFunctions.clearMessages();// Clear display context view log
            UIFunctions.addSystemMessage("Opening private chat with " + onlineUser + "...");
            state.socket.emit('join_private_chat', onlineUser);
        };
        usersListContainer.appendChild(userBtn);
    });
    loadFriends();
};



window.renderOnlineUsers = renderOnlineUsers;

window.loadFriendRequests = loadFriendRequests;
window.loadFriends = loadFriends;
window.renderFriends = renderFriends;
window.renderFriendRequests = renderFriendRequests;
window.initializeFriends = initializeFriends;
