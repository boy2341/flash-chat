const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt
const MIN_PASSWORD_LENGTH = 6; // Minimum password length
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token provided."
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded user data to the request
        next(); // Let them pass
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }
};
router.post("/api/register", async (req, res) => {
    try {
        const username = (req.body.username || "").trim();
        const password = req.body.password || "";
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required." });
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
        }
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ success: false, message: "That username is already taken." });
        }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({
            username,
            password: passwordHash,
            friends: []
        });
        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({ token, username: user.username });
    } catch (err) {
        console.error("Register Route Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/api/login", async (req, res) => {
    try {
        const username = (req.body.username || "").trim();
        const password = req.body.password || "";
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required." });
        }
        const user = await User.findOne({ username });
        if (!user) {
            // Same generic message as a wrong password below — don't reveal
            // whether the username exists.
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }
        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({ token, username: user.username });
    } catch (err) {
        console.error("Login Route Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/api/username", async (req, res) => {
    try {
        const username = req.body.username.trim();
        let user = await User.findOne({ username });
        if (!user) {
            user = await User.create({ username: username, friends: [] });
        }
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, username: user.username });
    } catch (err) {
        console.error("Auth Route Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/api/friends/:username", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username
        }).populate("friends", "username");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, friends: user.friends });
    } catch (err) {
        console.error("Friends Route Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;