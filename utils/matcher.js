// utils/matcher.js
let waitingQueue = [];

module.exports = {
    // Add a user's socket ID to the queue
    addWaitingUser: (socketId) => {
        if (!waitingQueue.includes(socketId)) {
            waitingQueue.push(socketId);
        }
    },

    // Check if we can make a match (need at least 2 people)
    matchUsers: () => {
        if (waitingQueue.length >= 2) {
            const user1 = waitingQueue.shift();
            const user2 = waitingQueue.shift();
            return [user1, user2];
        }
        return null;
    },

    // Remove a user if they disconnect before finding a match
    removeFromQueue: (socketId) => {
        waitingQueue = waitingQueue.filter(id => id !== socketId);
    }
};