const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        type: {
            type: String, enum: ["global", "private", "room"], required: true
        },
        sender: { type: String, required: true },
        receiver: { type: String, default: null },
        room: { type: String, default: null },
        roomId: { type: String, default: null },
        text: { type: String, required: true }
    },
    {
        timestamps: true
    });
module.exports = mongoose.model("Message", messageSchema);