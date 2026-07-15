const mongoose = require("mongoose");
const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: "💬"
    }
});
module.exports = mongoose.model("ChatRoom", chatRoomSchema);