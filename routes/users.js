const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth"); // Pull in your JWT checker!
router.get("/search", async (req, res) => {
    try {
        const q = req.query.q || "";

        const users = await User.find({
            username: {
                $regex: q,
                $options: "i"
            }
        })
            .select("username profilePicture status")
            .limit(20); // PROTECT YOUR DB: Limit to 20 results max

        res.json({
            success: true,
            users
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get("/:username", async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});


/*
==========================================
UPDATE USER INTERESTS
PUT /api/users/interests
==========================================
*/
// PROTECTED ROUTE: Added 'auth' middleware so only logged-in users can do this
router.put("/interests", auth, async (req, res) => {
    try {
        const { interests } = req.body;

        // SECURITY: Get the username from the VERIFIED token, not the request body!
        const username = req.user.username;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        user.interests = interests;
        await user.save();

        res.json({
            success: true,
            message: "Interests updated successfully.",
            interests: user.interests
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;