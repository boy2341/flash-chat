FlashChat is a real-time, multi-modal communication platform designed to connect users through instant public, private, and randomized messaging.

The system intelligently routes and connects users across different communication environments for:

* 🌍 Global public networking
* 🎲 Anonymous stranger matchmaking
* 🔒 Secure private conversations

Our goal is to provide a seamless, low-latency messaging experience with a robust social system and secure authentication.

This platform provides two primary modules:

1. **Stranger Matchmaking System** – Instantly pairs users in temporary, anonymous private rooms.
2. **Integrated Social Engine** – Manages authenticated user profiles, friend requests, and permanent private messaging channels.

The following sections describe the system workflow, interaction models, and core capabilities.

---

### Anonymous Stranger Routing

The Stranger Module focuses on providing users with instant, commitment-free interactions with random participants globally.

Many chat platforms struggle with user discovery. This module solves that by utilizing a real-time queuing architecture to pair active users seamlessly.

**How It Works**

The system manages user availability through a dynamic waiting pool:

* A user initiates a search for a stranger.
* The matching engine identifies another available user in the queue.
* A secure, temporary WebSocket room is generated exclusively for the two participants.

The system empowers users with full control over the session:

* Messages are broadcasted strictly within the isolated room.
* Users can instantly terminate the connection using the "Skip" feature.
* Upon skipping or disconnecting, the system gracefully destroys the room and automatically routes the active user back into the matchmaking queue.

This ensures a continuous, fast-paced networking environment without manual room management.

---

### Integrated Social Engine

The Social Module is designed for structured, long-term communication between verified users.

In standard chat scenarios, identity and privacy are critical. The system prioritizes secure access, relationship building, and direct communication.

**Social Flow**

1. **Authentication:** Users securely log in via Google OAuth and establish a unique custom username.
2. **Discovery:** Users can search for other platform members and dispatch friend requests.
3. **Relationship Management:** The system handles the state of pending, accepted, or rejected connections.
4. **Private Tunneling:** Once connected as friends, users can initiate dedicated, 1-on-1 private chat sessions.
5. **Global Broadcasting:** Users also have access to a persistent Global Public Room for community-wide discussions.

This module guarantees that verified users can build a persistent network of contacts while maintaining the security of their private data through JWT-authenticated socket connections.
