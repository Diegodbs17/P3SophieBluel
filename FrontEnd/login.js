const loginUrl = "http://localhost:5678/api/users/login";

document.querySelector(".login-form").addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
    event.preventDefault();
    let user = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        // Effectuer une requête POST vers l'API
        let response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        // Vérifier si la requête a échoué
        if (!response.ok) {
            showError("Identifiants incorrects. Veuillez réessayer.");
            return;
        }
        let result = await response.json();
        sessionStorage.setItem("token", result.token);
        window.location.href = "http://127.0.0.1:5500/index.html";

    } catch (error) {
        console.error("Erreur lors de la connexion :", error.message);
        showError("Une erreur s'est produite. Veuillez réessayer plus tard.");
    }
}

// Fonction pour afficher un message d'erreur
function showError(message) {
    let errorDiv = document.querySelector(".errorDiv");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "errorDiv";
        document.querySelector(".login-form").appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}