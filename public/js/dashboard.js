const currentToken = localStorage.getItem("chat_token");
const currentUsername = localStorage.getItem("chat_username");
const dashboardStrangerBtn = document.getElementById("dashboardStrangerBtn");
if (!currentToken || !currentUsername) {
    alert("Session expired. Please log in again.");
    window.location.href = "/";
}
const dashboardUsernameE1 = document.getElementById("dasboardUsername");
const welcomeUserE1 = document.getElementById("welcomeUser");
if (dashboardUsernameE1) dashboardUsernameE1.textContent = currentUsername;
if (welcomeUserE1) welcomeUserE1.textContent = currentUsername;
// ... your existing communityGrid and friend logic ...
const grid = document.getElementById("communityGrid");
const dashboardSocket = io(window.location.origin, {
    auth: { token: currentToken }
});
dashboardSocket.on("connect", () => {
    dashboardSocket.emit("get_chatrooms");
})
dashboardSocket.on("chatrooms", (rooms) => {
    renderCommunityCards(rooms);
});
dashboardSocket.on("connect_error", (err) => {
    console.error("Dashboard socket error:", err.message);
    if (grid) grid.innerHTML = "<p>Couldn't load communities. Try refreshing.</p>";
});

function renderCommunityCards(rooms) {
    console.log("Rendering community cards for rooms:", rooms);
    grid.innerHTML = "";
    rooms.forEach(room => {
        const card = document.createElement("div");
        card.className = "community-card";
        const iconDiv = document.createElement("div");
        iconDiv.className = "community-icon";
        iconDiv.textContent = room.icon;
        const nameHeading = document.createElement("h3");
        nameHeading.textContent = room.name;
        const descPara = document.createElement("p");
        descPara.textContent = room.description;
        const footerDiv = document.createElement("div");
        footerDiv.className = "community-footer";
        const onlineCountSpan = document.createElement("span");
        onlineCountSpan.className = "online-count";
        onlineCountSpan.textContent = `👥 ${room.onlineUsers || 0}`;
        const joinBtn = document.createElement("button");
        joinBtn.className = "join-btn";
        joinBtn.textContent = "Join →";
        footerDiv.appendChild(onlineCountSpan);
        footerDiv.appendChild(joinBtn);
        card.appendChild(iconDiv);
        card.appendChild(nameHeading);
        card.appendChild(descPara);
        card.appendChild(footerDiv);
        card.onclick = () => {
            joinCommunity(room.name);
        };
        grid.appendChild(card);

    });
}
function joinCommunity(roomName) {
    console.log("Joining:", roomName);
    window.location.href = "/views/chat.html?room=" + encodeURIComponent(roomName);
}
if (dashboardStrangerBtn) {
    dashboardStrangerBtn.addEventListener("click", () => {
        window.location.href = "/views/chat.html?stranger=true";
    });
}

const friendsList = document.getElementById("friendsList");
let onlineUsernames = [];

async function loadDashboardFriends() {
    try {
        const response = await fetch(`/api/friends/${currentUsername}`, {
            headers: { "Authorization": `Bearer ${currentToken}` }
        });
        const result = await response.json();

        if (!result.success) {
            friendsList.innerHTML = "<p>Couldn't load friends.</p>";
            return;
        }
        window.dashboardFriends = result.friends;
        renderDashboardFriends(result.friends);
    } catch (err) {
        console.error("Error loading friends:", err);
        friendsList.innerHTML = "<p>Couldn't load friends.</p>";
    }
}

function renderDashboardFriends(friends) {
    friendsList.innerHTML = "";
    if (!friends.length) {
        friendsList.innerHTML = "<p>No friends yet.</p>";
        return;
    }
    friends.forEach(friend => {
        const isOnline = onlineUsernames.includes(friend.username);
        const div = document.createElement("div");
        div.className = "friend-item";
        const left = document.createElement("div");
        left.className = "friend-left";
        const avatar = document.createElement("div");
        avatar.className = "friend-avatar";
        avatar.textContent = friend.username[0].toUpperCase();
        const infoWrapper = document.createElement("div");
        const nameDiv = document.createElement("div");
        nameDiv.className = "friend-name";
        nameDiv.textContent = friend.username;
        const statusDiv = document.createElement("div");
        statusDiv.className = isOnline ? "online" : "offline";
        statusDiv.textContent = isOnline ? "Online" : "Offline";
        infoWrapper.appendChild(nameDiv);
        infoWrapper.appendChild(statusDiv);
        left.appendChild(avatar);
        left.appendChild(infoWrapper);
        const chatBtn = document.createElement("button");
        chatBtn.className = "message-btn";
        chatBtn.textContent = "Chat";
        chatBtn.dataset.username = friend.username;
        chatBtn.onclick = () => {
            window.location.href = "/views/chat.html?dm=" + encodeURIComponent(friend.username);
        };
        div.appendChild(left);
        div.appendChild(chatBtn);
        friendsList.appendChild(div);
    });
}

// Listen for live presence updates on the same socket already used for chatrooms
dashboardSocket.on("update_user_list", (usersArray) => {
    onlineUsernames = usersArray;
    if (window.dashboardFriends) {
        renderDashboardFriends(window.dashboardFriends);
    }
});

loadDashboardFriends();


window.renderCommunityCards = renderCommunityCards;
window.joinCommunity = joinCommunity;