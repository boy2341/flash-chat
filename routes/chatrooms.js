const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/ChatRoom");

// GET /api/chatrooms -> list all chat rooms for the dashboard
router.get("/", async (req, res) => {
    try {
        const rooms = await ChatRoom.find().sort({ name: 1 });
        res.json(rooms);
    } catch (err) {
        console.error("Error loading chat rooms:", err);
        res.status(500).json({ error: "Failed to load chat rooms" });
    }
});

module.exports = router;