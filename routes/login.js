const params = new URLSearchParams(window.location.search);
const usernameSection = document.getElementById("usernameSection");
const usernameInput = document.getElementById("usernameInput");
const continueBtn = document.getElementById("continueBtn");
if (params.get("newUser") === "true") {
    usernameSection.style.display = "block";
}

continueBtn.addEventListener("click", createUsername);
async function createUsername() {
    const username = usernameInput.value.trim();
    if (username.length < 3) {
        alert("Username must contain at least 3 characters.");
        return;
    }

    if (username.length > 20) {
        alert("Username cannot exceed 20 characters.");
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        alert("Only letters, numbers and underscore (_) are allowed.");
        return;
    }

    continueBtn.disabled = true;
    continueBtn.textContent = "Creating Account...";

    try {

        const response = await fetch("/api/username", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.error || "Unable to create account.");

            return;

        }

        localStorage.setItem("chat_token", data.token);
        localStorage.setItem("chat_username", data.username);
        window.location.href = `/views/dashboard.html?token=${data.token}&username=${encodeURIComponent(data.username)}`;
    } catch (err) {
        console.error(err);
        alert("Server unavailable. Please try again.");
    } finally {
        continueBtn.disabled = false;
        continueBtn.textContent = "Continue";
    }
}