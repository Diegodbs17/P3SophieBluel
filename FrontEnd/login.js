const loginUrl = "http://localhost:5678/api/users/login";

// Ajouter un écouteur d'événements sur le formulaire
document.querySelector(".login-form").addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les données de l'utilisateur depuis les champs de formulaire
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
            return; // Arrêter l'exécution de la fonction en cas d'erreur
        }

        // Récupérer le token et rediriger si la requête réussit
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
    let errorDiv = document.querySelector(".errorDiv"); // Rechercher un élément existant

    // Si l'élément n'existe pas, le créer
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "errorDiv"; // Définir la classe
        document.querySelector(".login-form").appendChild(errorDiv); // Ajouter au formulaire
    }

    // Ajouter le message d'erreur
    errorDiv.textContent = message;
}