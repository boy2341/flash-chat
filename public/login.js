const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const continueBtn = document.getElementById("continueBtn");
const errorMessage = document.getElementById("errorMessage");

function showError(message) {
    errorMessage.textContent = message;
}

async function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    showError("");

    if (!username || !password) {
        showError("Please enter a username and password.");
        return;
    }

    continueBtn.disabled = true;
    continueBtn.textContent = "Logging in...";

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.message || "Login failed. Please try again.");
            return;
        }

        localStorage.setItem("chat_token", data.token);
        localStorage.setItem("chat_username", data.username);
        window.location.href = "/views/dashboard.html";

    } catch (err) {
        console.error("Login error:", err);
        showError("Unable to reach the server. Please try again.");
    } finally {
        continueBtn.disabled = false;
        continueBtn.textContent = "Log In →";
    }
}

continueBtn.addEventListener("click", handleLogin);

[usernameInput, passwordInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleLogin();
    });
});