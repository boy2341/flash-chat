const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String, default: "" },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessageTime: { type: Date, default: Date.now },
    unreadCount: { type: Map, of: Number, default: {} },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Conversation", conversationSchema);