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
        displayGalleryModal(worksData);
        addDeleteEventListeners();
    } catch (error) {
        console.error("Erreur lors du chargement des travaux :", error.message); // Affiche l'erreur en console
    }
}

// Fonction pour générer dynamiquement les boutons de filtre
function generateFilterButtons() {
    const filterContainer = document.querySelector(".filter-container");
    filterContainer.innerHTML = ""; // Vide le conteneur

    const categories = new Set();
    categories.add("Tous");

    worksData.forEach(work => {
        categories.add(work.category.name);
    });

    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category;
        button.classList.add("btn");

        if (category === "Tous") {
            button.classList.add("btn-all");
        }

        button.addEventListener("click", () => {
            const categoryFilter = category === "Tous" ? "all" : category;
            applyFilter(categoryFilter);
            setActiveButton(button);
        });

        filterContainer.appendChild(button);
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


// ADMIN

function showEditBanner() {
    if (sessionStorage.token !== undefined) {
        const editBanner = document.querySelector(".banner-editmode")
        const header = document.querySelector("header")
        const editBtn = document.querySelector(".edit-Btn")
        const loginBtn = document.querySelector(".login-link")
        editBanner.style.display = 'block';
        editBtn.style.display = 'inline-block';
        header.classList.add("mgt-header");
        loginBtn.textContent = "logout"
    }
}

showEditBanner()

// MODAL

let modal = null
const focusableSelector = "button, a, input, textarea"
let focusables = []
let previouslyFocusedElement = null

const openModal = function (e) {
    e.preventDefault()
    modal = document.querySelector(e.target.getAttribute("href"))
    focusables = Array.from(modal.querySelector(focusableSelector))
    previouslyFocusedElement = document.querySelector(":focus")
    modal.style.display = null
    //focusables[0].focus()
    modal.removeAttribute("aria-hidden")
    modal.setAttribute("aria-modal", "true")
    modal.addEventListener("click", closeModal)
    modal.querySelectorAll(".js-close-modal").forEach((element) =>
        element.addEventListener("click", closeModal)
    );
    modal.querySelectorAll(".js-modal-stop").forEach((element) =>
        element.addEventListener("click", stopPropagation)
    );
    const modal2 = document.querySelector(".modal-wrapper-2")
    modal2.style.display = "none"
}

const closeModal = function (e) {
    if (modal === null || !modal.contains(e.target)) return;
    e.preventDefault()
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus()
    modal.setAttribute("aria-hidden", "true")
    modal.removeAttribute("aria-modal")
    modal.removeEventListener("click", closeModal)
    modal.querySelectorAll(".js-close-modal").forEach((element) =>
        element.removeEventListener("click", closeModal)
    );
    modal.querySelectorAll(".js-modal-stop").forEach((element) =>
        element.removeEventListener("click", stopPropagation)
    );
    const hideModal = function () {
        modal.style.display = "none"
        modal.removeEventListener("animationend", hideModal)
        modal = null
    }
    modal.addEventListener("animationend", hideModal)
    const modal2 = document.querySelector(".modal-wrapper-2")
    const modal1 = document.querySelector(".modal-wrapper")
    window.setTimeout(() => {
        modal2.style.display = "none";
        modal1.style.display = "block";
    }, "500");
}

const deleteBtn = function (e) {
    e.preventDefault();
    //clicked button
    if (e.target.matches(".fa-trash-can")) {
      deleteWork(e.target.id);
    }
  };

const stopPropagation = function (e) {
    e.stopPropagation()
}

const focusInModal = function (e) {
    e.preventDefault()
    let index = focusables.findIndex(f => f === modal.querySelector(":focus"))
    if (e.shiftKey === true ) {
        index--
    } else {
        index++
    }
    if (index >= focusables.length) {
        index = 0
    }
    if (index < 0) {
        index = focusables.length - 1
    }
    focusables[index].focus()
}

document.querySelectorAll(".modal").forEach(a => {
    a.addEventListener("click", openModal)
})

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal(e);
    }
    if (e.key === "Tab" && modal !== null) {
        focusInModal(e)
    }
});


function displayGalleryModal(works) {
    const galleryModal = document.querySelector(".galleryModal"); // Sélectionne la galerie dans le DOM
    galleryModal.innerHTML = ""; // Vide la galerie avant d'afficher de nouvelles travaux

    // Parcourt chaque travaux dans la liste et appelle la fonction createFigure pour l'afficher
    works.forEach(createFigureModal);
}


function createFigureModal(work) {
    const galleryModal = document.querySelector(".galleryModal");
    const figureModal = document.createElement("figure");
    figureModal.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <button type="button" class="btn-trash" data-id="${work.id}">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    figureModal.style.position = "relative";

    // Ajout direct de l'événement
    const deleteButton = figureModal.querySelector(".btn-trash");
    deleteButton.addEventListener("click", async (e) => {
        e.preventDefault(); // Important
        const workId = deleteButton.getAttribute("data-id");
        console.log("Suppression en cours pour l'ID :", workId);
        await deleteWork(workId);
    });

    galleryModal.appendChild(figureModal);
}

function addDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll(".btn-trash"); // Sélectionne tous les boutons trash
    deleteButtons.forEach(button => {
        button.addEventListener("click", async (event) => {
            const workId = button.getAttribute("data-id"); // Récupère l'ID depuis l'attribut data-id
            console.log("Bouton cliqué", workId); // Ajout d'un log ici
            console.log(`Suppression du projet avec l'ID : ${workId}`);
            await deleteWork(workId); // Appelle la fonction pour supprimer le projet
        });
    });
}

async function deleteWork(workId) {
    const deleteUrl = `http://localhost:5678/api/works/${workId}`;
    const token = sessionStorage.token;

    try {
        const response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }

        console.log(`Projet avec l'ID ${workId} supprimé avec succès.`);
        worksData = worksData.filter(work => work.id !== parseInt(workId));
        displayGalleryModal(worksData); 
        displayGallery(worksData);

    } catch (error) {
        console.error("Erreur lors de la suppression :", error.message);
        alert("Une erreur est survenue lors de la suppression. Veuillez réessayer.");
    }
}

function showModal2() {
    const btnAdd = document.querySelector(".addPhoto-modal")
    const modal2 = document.querySelector(".modal-wrapper-2")
    const modal1 = document.querySelector(".modal-wrapper")
    btnAdd.addEventListener("click", function () {
        modal2.style.display = "block";
        modal1.style.display = "none";
    });
}

showModal2()

function previousModal() {
    const previousArrow = document.querySelector(".js-previous-modal")
    const modal2 = document.querySelector(".modal-wrapper-2")
    const modal1 = document.querySelector(".modal-wrapper")
    previousArrow.addEventListener("click", function () {
        modal1.style.display = "block";
        modal2.style.display = "none";
    });
}

previousModal()