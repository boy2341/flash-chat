const state = {
    socket: null,
    username: "",
    authToken: "",
    strangerMode: false,
    chatRoomMode: false,
    isPrivateMode: false,
    currentRoomId: null,
    currentChatRoom: null,
    currentInterest: "",
    pendigDmTarget: null,
    pendingRoomTarget: null,
    pendingStrangerMode: null
};
window.state = state;