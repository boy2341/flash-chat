const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
module.exports = function (io, socket) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication Failed"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.username = decoded.username;
            next();

        } catch (err) {

            if (err.name === "TokenExpiredError") {
                return next(new Error("TokenExpired"));
            }

            return next(new Error("Authentication Failure"));

        }

    });

};