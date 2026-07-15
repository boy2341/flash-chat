const homePage = document.getElementById('homePage');
const chatPage = document.getElementById('chatPage');
const messagesBox = document.getElementById('messagesBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById("sendBtn");
const roomTitleHeading = document.getElementById("roomTitleHeading");
const statusDot = document.getElementById('statusDot');
const backBtn = document.getElementById('backBtn');
const usersList = document.getElementById("usersList");
const leaveStrangerBtn = document.getElementById("leaveStrangerBtn");   // ADD
const skipStrangerBtn = document.getElementById("skipStrangerBtn");  
window.UI = {
    homePage,
    chatPage,
    backBtn,
    statusDot,
    sendBtn,
    messageInput,
    messagesBox,
    roomTitleHeading,
    usersList
    leaveStrangerBtn
    skipStrangerBtn 
};
function styleUserButton(button, active) {
    if (active) {
        button.style.background = "#00a8ff";
    } else {
        button.style.background = "#333";
    }
}
function addSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'system');
    msgDiv.textContent = text;
    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}
function appendMessage(data) {
    const div = document.createElement("div");
    div.classList.add(
        data.user === state.username
            ? "my-message"
            : "other-message"
    );
    const nameE1 = document.createElement("strong");
    nameE1.textContent = data.user;
    const textE1 = document.createElement("div");
    textE1.textContent = data.text;
    div.appendChild(nameE1);
    div.appendChild(textE1);
    UI.messagesBox.appendChild(div);
    UI.messagesBox.scrollTop =
        UI.messagesBox.scrollHeight;
}
function clearMessages() {
    UI.messagesBox.innerHTML = "";
}
function changeRoomTitle(title) {
    UI.roomTitleHeading.textContent = title;
}
function scrollBottom() {
    UI.messagesBox.scrollTop =
        UI.messagesBox.scrollHeight;
}
window.UIFunctions = {
    appendMessage,
    addSystemMessage,
    clearMessages,
    changeRoomTitle,
    scrollBottom,
    styleUserButton
};
