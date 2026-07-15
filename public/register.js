const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const continueBtn = document.getElementById("continueBtn");
const errorMessage = document.getElementById("errorMessage");

function showError(message) {
    errorMessage.textContent = message;
}

async function handleRegister() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    showError("");

    if (!username || !password || !confirmPassword) {
        showError("Please fill in all fields.");
        return;
    }
    if (password.length < 6) {
        showError("Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        showError("Passwords don't match.");
        return;
    }

    continueBtn.disabled = true;
    continueBtn.textContent = "Creating account...";

    try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.message || "Registration failed. Please try again.");
            return;
        }

        localStorage.setItem("chat_token", data.token);
        localStorage.setItem("chat_username", data.username);
        window.location.href = "/views/dashboard.html";

    } catch (err) {
        console.error("Register error:", err);
        showError("Unable to reach the server. Please try again.");
    } finally {
        continueBtn.disabled = false;
        continueBtn.textContent = "Create Account →";
    }
}

continueBtn.addEventListener("click", handleRegister);

[usernameInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleRegister();
    });
});