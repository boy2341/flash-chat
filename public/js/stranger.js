const findStrangerBtn = document.getElementById("findStrangerBtn");
const leaveStrangerBtn = document.getElementById("leaveStrangerBtn");
const skipStrangerBtn = document.getElementById("skipStrangerBtn");
const interestSelect = document.getElementById("interestSelect");

function initializeStranger() {
    if (interestSelect) {
        state.currentInterest = interestSelect.value;
    }
    findStrangerBtn.onclick = () => {
        state.strangerMode = true;
        state.chatRoomMode = false;
        state.isPrivateMode = false;
        state.socket.emit(
            "find_stranger",
            state.currentInterest
        );
        UIFunctions.changeRoomTitle(
            "Searching..."
        );
    };
    leaveStrangerBtn.onclick = () => {
        state.socket.emit("leave_stranger");
    };
    skipStrangerBtn.onclick = () => {
        state.socket.emit("skip_stranger");
    };
}
function showStrangerControls() {
    leaveStrangerBtn.style.display = "block";
    skipStrangerBtn.style.display = "block";
}

function hideStrangerControls() {
    leaveStrangerBtn.style.display = "none";
    skipStrangerBtn.style.display = "none";
}

window.showStrangerControls = showStrangerControls;
window.hideStrangerControls = hideStrangerControls;
window.initializeStranger = initializeStranger;