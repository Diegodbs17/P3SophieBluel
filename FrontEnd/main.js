let worksData = []; // Une liste vide pour stocker toutes les travaux récupérées depuis l'API

// Fonction principale pour récupérer les travaux depuis l'API
async function getWorks() {
    const worksUrl = "http://localhost:5678/api/works"; // URL de l'API qui retourne les travaux
    try {
        const response = await fetch(worksUrl); // On récupère les données avec fetch
        if (!response.ok) {
            // Si la réponse n'est pas "ok" (statut HTTP 200), on lance une erreur
            throw new Error(`Erreur : ${response.status}`);
        }

        worksData = await response.json(); // Convertit les données JSON récupérées et les stock dans worksData
        generateFilterButtons(); // Appelle une fonction pour créer dynamiquement les boutons de filtre
        applyFilter("all"); // Affiche les travaux dès le chargement de la page
        setActiveButton(document.querySelector(".btn-all")); // Définit le bouton "Tous" comme actif
    } catch (error) {
        console.error("Erreur lors du chargement des travaux :", error.message); // Affiche l'erreur en console
    }
}

// Fonction pour générer dynamiquement les boutons de filtre
function generateFilterButtons() {
    const categories = new Set(); // Utilise un Set pour éviter les doublons de catégories
    categories.add("Tous"); // Ajoute manuellement la catégorie "Tous" pour afficher toutes les travaux

    // Parcourt les travaux et ajoute leurs catégories dans le Set
    worksData.forEach(work => {
        categories.add(work.category.name); // Ajoute chaque catégorie au Set
    });

    const filterContainer = document.querySelector(".filter-container"); // Sélectionne le conteneur des boutons dans le DOM

    // Pour chaque catégorie dans le Set, on crée un bouton
    categories.forEach(category => {
        const button = document.createElement("button"); // Crée un élément <button>
        button.textContent = category; // Définit le texte du bouton avec le nom de la catégorie
        button.classList.add("btn"); // Ajoute une classe "btn" pour appliquer des styles CSS communs

        // Si la catégorie est "Tous", on lui donne une classe supplémentaire pour le style
        if (category === "Tous") {
            button.classList.add("btn-all");
        }

        // Ajoute un événement "click" pour appliquer le filtre quand on clique sur le bouton
        button.addEventListener("click", () => {
            const categoryFilter = category === "Tous" ? "all" : category; // Si c'est "Tous", on filtre avec "all"
            applyFilter(categoryFilter); // Applique le filtre correspondant
            setActiveButton(button); // Définit le bouton cliqué comme actif
        });

        filterContainer.appendChild(button); // Ajoute le bouton dans le conteneur
    });
}

// Fonction pour afficher les travaux filtrées
function displayGallery(works) {
    const gallery = document.querySelector(".gallery"); // Sélectionne la galerie dans le DOM
    gallery.innerHTML = ""; // Vide la galerie avant d'afficher de nouvelles travaux

    // Parcourt chaque travaux dans la liste et appelle la fonction createFigure pour l'afficher
    works.forEach(createFigure);
}

// Fonction pour créer un élément <figure>
function createFigure(work) {
    const gallery = document.querySelector(".gallery"); // Sélectionne la galerie dans le DOM
    const figure = document.createElement("figure"); // Crée un élément <figure>
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}"> <!-- Ajoute une image -->
        <figcaption>${work.title}</figcaption> <!-- Ajoute un titre -->
    `;
    gallery.appendChild(figure); // Ajoute le <figure> dans la galerie
}

// Fonction pour appliquer un filtre basé sur une catégorie
function applyFilter(category) {
    // Si la catégorie est "all", on utilise toutes les travaux, sinon on filtre par catégorie
    const filteredWorks = category === "all"
        ? worksData // Garde toutes les travaux si "all"
        : worksData.filter(work => work.category.name === category); // Sinon, garde seulement celles de la catégorie

    displayGallery(filteredWorks); // Affiche les travaux filtrés
}

// Fonction pour mettre à jour le bouton actif
function setActiveButton(activeButton) {
    // Supprime la classe "active" de tous les boutons pour désactiver leur style
    document.querySelectorAll(".btn").forEach(button => {
        button.classList.remove("active");
    });

    // Ajoute la classe "active" au bouton cliqué pour le mettre en focus
    activeButton.classList.add("active");
}

// Appelle la fonction principale pour récupérer et afficher les travaux dès le chargement de la page
getWorks();