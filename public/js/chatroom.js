const userCountBadge = document.getElementById('userCountBadge');

function initializeChatRooms() {
    document.querySelectorAll(".roomBtn").forEach(button => {
        button.onclick = () => {
            const room = button.dataset.room;
            if (state.strangerMode) {
                state.socket.emit("leave_stranger");
                state.strangerMode = false;
            }
            if (state.isPrivateMode) {
                state.socket.emit("leave_private_room");
                state.isPrivateMode = false;
            }
            UIFunctions.clearMessages();
            state.chatRoomMode = true;
            if (state.currentChatRoom === room)
                return;
            state.currentChatRoom = room;
            console.log("Joining chat room:", room);
            state.socket.emit("join_chatroom", room);
        };
    });
}
function switchToGlobalRoom() {
    state.isPrivateMode = false;
    state.currentRoomId = "global";
    if (state.socket && state.socket.connected) {
        socket.emit("leave_private_room");
    }
    UIFunctions.changeRoomTitle("Global Public Room");
    UIFunctions.clearMessages();
    UIFunctions.addSystemMessage("Returned to Global Room.");
}
window.switchToGlobalRoom = switchToGlobalRoom;
window.initializeChatRooms = initializeChatRooms;