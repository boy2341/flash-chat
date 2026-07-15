const express = require("express");
const router = express.Router();
const User = require("../models/User");
console.log("User Model:", User);
console.log("findOne:", User.findOne);
console.log("Model Name:", User.modelName);
const FriendRequest = require("../models/FriendRequest");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

router.post("/request", async (req, res) => {

    try {

        const { senderUsername, receiverUsername } = req.body;

        if (!senderUsername || !receiverUsername) {
            return res.status(400).json({
                success: false,
                message: "Both usernames are required."
            });
        }

        if (senderUsername === receiverUsername) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a request to yourself."
            });
        }

        const sender = await User.findOne({
            username: senderUsername
        });

        const receiver = await User.findOne({
            username: receiverUsername
        });

        if (!sender || !receiver) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (sender.friends.includes(receiver._id)) {
            return res.status(400).json({
                success: false,
                message: "Already friends."
            });
        }

        const existingRequest = await FriendRequest.findOne({

            $or: [

                {
                    sender: sender._id,
                    receiver: receiver._id,
                    status: "pending"
                },

                {
                    sender: receiver._id,
                    receiver: sender._id,
                    status: "pending"
                }

            ]

        });

        if (existingRequest) {

            return res.status(400).json({

                success: false,

                message: "Friend request already exists."

            });

        }

        const request = new FriendRequest({

            sender: sender._id,

            receiver: receiver._id

        });

        await request.save();

        res.json({

            success: true,

            message: "Friend request sent successfully."

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});
router.get("/requests/:username", async (req, res) => {

    try {

        const username = req.params.username;

        const user = await User.findOne({
            username: username
        });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        const requests = await FriendRequest.find({

            receiver: user._id,

            status: "pending"

        })
            .populate("sender", "username profilePicture email")
            .sort({ createdAt: -1 });

        res.json({

            success: true,

            requests

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});
/*
==========================================
ACCEPT FRIEND REQUEST
PATCH /api/friends/accept/:requestId
==========================================
*/

router.patch("/accept/:requestId", async (req, res) => {

    try {

        const request = await FriendRequest.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found."
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Request already processed."
            });
        }

        request.status = "accepted";

        await request.save();

        await User.findByIdAndUpdate(
            request.sender,
            {
                $addToSet: {
                    friends: request.receiver
                }
            }
        );

        await User.findByIdAndUpdate(
            request.receiver,
            {
                $addToSet: {
                    friends: request.sender
                }
            }
        );

        const conversation = new Conversation({

            participants: [
                request.sender,
                request.receiver
            ]

        });

        await conversation.save();

        res.json({

            success: true,

            message: "Friend request accepted.",

            conversation

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});
/*
==========================================
ACCEPT FRIEND REQUEST
POST /api/friends/accept
==========================================
*/

router.post("/accept", async (req, res) => {

    try {

        const { requestId } = req.body;

        const request = await FriendRequest.findById(requestId);

        if (!request) {

            return res.status(404).json({
                success: false,
                message: "Request not found."
            });

        }

        request.status = "accepted";

        await request.save();

        await User.findByIdAndUpdate(
            request.sender,
            {
                $addToSet: {
                    friends: request.receiver
                }
            }
        );

        await User.findByIdAndUpdate(
            request.receiver,
            {
                $addToSet: {
                    friends: request.sender
                }
            }
        );

        const sender = await User.findById(request.sender);

        res.json({

            success: true,

            senderUsername: sender.username

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});
/*
==========================================
REJECT FRIEND REQUEST
PATCH /api/friends/reject/:requestId
==========================================
*/

router.patch("/reject/:requestId", async (req, res) => {

    try {

        const request = await FriendRequest.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found."
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Request already processed."
            });
        }

        request.status = "rejected";

        await request.save();

        res.json({
            success: true,
            message: "Friend request rejected."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});
/*
==========================================
REJECT FRIEND REQUEST
POST /api/friends/reject
==========================================
*/

router.post("/reject", async (req, res) => {

    try {

        const { requestId } = req.body;

        await FriendRequest.findByIdAndDelete(requestId);

        res.json({

            success: true

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});
/*
==========================================
GET FRIENDS LIST
GET /api/friends/:username
==========================================
*/

/*
==========================================
GET FRIENDS LIST
GET /api/friends/:username
==========================================
*/

router.get("/:username", async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username
        }).populate(
            "friends",
            "username profilePicture status lastSeen"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Simply return the populated friends array
        res.json({
            success: true,
            friends: user.friends
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;