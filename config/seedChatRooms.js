const ChatRoom = require("../models/ChatRoom");
async function seedChatRooms() {
    try {
        const count = await ChatRoom.countDocuments();
        if (count > 0) {
            console.log("✅ Chat rooms already exist.");
            return;
        }
        await ChatRoom.insertMany([
            {
                name: "Programming",
                description: "Discuss coding, AI, web development and more.",
                icon: "💻",
                color: "#3B82F6"
            },
            {
                name: "Gaming",
                description: "Gaming, esports and new releases.",
                icon: "🎮",
                color: "#8B5CF6"
            },
            {
                name: "Movies",
                description: "Movies, TV shows and anime.",
                icon: "🎬",
                color: "#EF4444"
            },
            {
                name: "Music",
                description: "Music lovers community.",
                icon: "🎵",
                color: "#10B981"
            },
            {
                name: "Sports",
                description: "Football, Cricket and F1.",
                icon: "⚽",
                color: "#F59E0B"
            },
            {
                name: "AI",
                description: "Share memes and have fun.",
                icon: "😂",
                color: "#EC4899"
            }
        ]);
        console.log("✅ Default chat rooms created.");
    } catch (err) {
        console.error("Chat room seed failed:", err);
    }
}
module.exports = seedChatRooms;