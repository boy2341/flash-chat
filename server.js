require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const seedChatRooms = require("./config/seedChatRooms");
const mongoose = require('mongoose');
const authRoutes = require("./middleware/auth");
mongoose.connect(process.env.MONGO_URI,)
    .then(async () => {
        console.log("MongoDB connected successfully");
        await seedChatRooms();
    })
    .catch((err) => console.error("MongoDB connection error:", err));
const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3002";
app.use(express.json());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/views", express.static(path.join(__dirname, "views")));
const userRoutes = require("./routes/users");
const friendRoutes = require("./routes/friends");
const chatRoomRoutes = require("./routes/chatrooms");
const { prototype } = require('stream');
app.use("/", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chatrooms", chatRoomRoutes); // Use the chatRoomRoutes for the root path
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL } });
require("./socket")(io);
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'login.html')); });
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log("Server active on port 3002 (Private Room Mode)"));