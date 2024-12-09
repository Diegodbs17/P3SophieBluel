// Variables Globales

let worksData = [];
const worksUrl = "http://localhost:5678/api/works";
const token = sessionStorage.token;

// Appels Function Globales

getWorks();
showEditBanner()
addDeleteEventListeners();
showModal2()
previousModal()
getCategorySelect()
newWork()

// Fonction principale pour récupérer les travaux depuis l'API
async function getWorks() {
    try {
        const response = await fetch(worksUrl);
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }
        worksData = await response.json();
        generateFilterButtons();
        applyFilter("all");
        setActiveButton(document.querySelector(".btn-all"));
        displayGalleryModal(worksData);
        getCategorySelect()
    } catch (error) {
        console.error("Erreur lors du chargement des travaux :", error.message);
    }
}

// Fonction pour générer dynamiquement les boutons de filtre
function generateFilterButtons() {
    const filterContainer = document.querySelector(".filter-container");
    filterContainer.innerHTML = "";

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
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    works.forEach(createFigure);
}

// Fonction pour créer un élément <figure>
function createFigure(work) {
    const gallery = document.querySelector(".gallery");
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
}

// Fonction pour appliquer un filtre basé sur une catégorie
function applyFilter(category) {
    const filteredWorks = category === "all"
        ? worksData
        : worksData.filter(work => work.category.name === category);
    displayGallery(filteredWorks);
}

// Fonction pour mettre à jour le bouton actif
function setActiveButton(activeButton) {
    document.querySelectorAll(".btn").forEach(button => {
        button.classList.remove("active");
    });
    activeButton.classList.add("active");
}

// bannière Administrateur
function showEditBanner() {
    if (sessionStorage.token !== undefined) {
        const editBanner = document.querySelector(".banner-editmode")
        const header = document.querySelector("header")
        const editBtn = document.querySelector(".edit-Btn")
        const loginBtn = document.querySelector(".login-link")
        const filterContainer = document.querySelector(".filter-container")
        const galleryWork = document.querySelector(".gallery")
        editBanner.style.display = 'block';
        editBtn.style.display = 'inline-block';
        header.classList.add("mgt-header");
        loginBtn.textContent = "logout"
        filterContainer.style.display = "none"
        galleryWork.style.marginTop = "85px"
    }
}

// Modal

let modal = null
const focusableSelector = "button, a, input, textarea"
let focusables = []
let previouslyFocusedElement = null

const openModal = function (e) {
    e.preventDefault();
    modal = document.querySelector(e.target.getAttribute("href"));
    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    previouslyFocusedElement = document.querySelector(":focus");
    modal.style.display = null;
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener("click", closeModal);
    modal.querySelectorAll(".js-close-modal").forEach((element) =>
        element.addEventListener("click", closeModal)
    );
    modal.querySelectorAll(".js-modal-stop").forEach((element) =>
        element.addEventListener("click", stopPropagation)
    );

    // Réinitialiser l'état de fileInput
    const fileInput = document.getElementById("file");
    fileInput.value = ""; // Réinitialise le champ fichier

    // Réinitialiser le conteneur d'images
    resetImageContainer();

    const modal2 = document.querySelector(".modal-wrapper-2");
    modal2.style.display = "none";
};

const closeModal = function (e) {
    if (modal === null || !modal.contains(e.target)) return;
    e.preventDefault();
    resetImageContainer(); // Réinitialise le conteneur d'images et réaffiche les "picture-loaded"
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modal.removeEventListener("click", closeModal);
    modal.querySelectorAll(".js-close-modal").forEach((element) =>
        element.removeEventListener("click", closeModal)
    );
    modal.querySelectorAll(".js-modal-stop").forEach((element) =>
        element.removeEventListener("click", stopPropagation)
    );
    const hideModal = function () {
        modal.style.display = "none";
        modal.removeEventListener("animationend", hideModal);
        modal = null;
    };
    modal.addEventListener("animationend", hideModal);
    const modal2 = document.querySelector(".modal-wrapper-2");
    const modal1 = document.querySelector(".modal-wrapper");
    window.setTimeout(() => {
        modal2.style.display = "none";
        modal1.style.display = "block";
    }, "500");
};

const deleteBtn = function (e) {
    e.preventDefault();
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

// Afficher les travaux dans la modale
function displayGalleryModal(works) {
    const galleryModal = document.querySelector(".galleryModal");
    galleryModal.innerHTML = "";
    works.forEach(createFigureModal);
}

// Créer les figures dans la modale
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

    // Ecoute sur le bouton Trash
    const deleteButton = figureModal.querySelector(".btn-trash");
    deleteButton.addEventListener("click", async (e) => {
        e.preventDefault(); // Important
        const workId = deleteButton.getAttribute("data-id");
        console.log("Suppression en cours pour l'ID :", workId);
        await deleteWork(workId);
    });
    galleryModal.appendChild(figureModal);
}

// Au clique sur le bouton trash ça delete un projet
function addDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll(".btn-trash");
    deleteButtons.forEach(button => {
        button.addEventListener("click", async (event) => {
            const workId = button.getAttribute("data-id");
            await deleteWork(workId);
        });
    });
}

// Fonction DELETE
async function deleteWork(workId) {
    const deleteUrl = `http://localhost:5678/api/works/${workId}`;
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
        worksData = worksData.filter(work => work.id !== parseInt(workId));
        displayGalleryModal(worksData); 
        displayGallery(worksData);
    } catch (error) {
        console.error("Erreur lors de la suppression :", error.message);
    }
}

// Afficher la modale 2
function showModal2() {
    const btnAdd = document.querySelector(".addPhoto-modal")
    const modal2 = document.querySelector(".modal-wrapper-2")
    const modal1 = document.querySelector(".modal-wrapper")
    btnAdd.addEventListener("click", function () {
        modal2.style.display = "block";
        modal1.style.display = "none";
    });
}

// Retourner en arrière avec la Arrow Left
function previousModal() {
    const previousArrow = document.querySelector(".js-previous-modal");
    const modal2 = document.querySelector(".modal-wrapper-2");
    const modal1 = document.querySelector(".modal-wrapper");
    previousArrow.addEventListener("click", function () {
        resetImageContainer();
        modal1.style.display = "block";
        modal2.style.display = "none";
    });
}

function getCategorySelect() {
    const inputSelect = document.querySelector("#category");
    inputSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Choisissez une catégorie";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    inputSelect.appendChild(defaultOption);

    const categories = new Set();

    worksData.forEach(work => {
        if (work.category && work.category.name) {
            categories.add(`${work.category.id}|${work.category.name}`);
        }
    });

    categories.forEach(categoryString => {
        const [id, name] = categoryString.split('|');
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        inputSelect.appendChild(option);
    });
}

// Gestion de l'ajout d'une nouvelle photo
function newWork() {
    const img = document.createElement("img");
    const fileInput = document.getElementById("file");
    let file;
    fileInput.style.display = "none";

    getCategorySelect();

    fileInput.addEventListener("change", function (event) {
        file = event.target.files[0];
        const maxFileSize = 4 * 1024 * 1024;
    
        if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
            if (file.size > maxFileSize) {
                alert("La taille de l'image ne doit pas dépasser 4 Mo.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                // Vider le conteneur d'images pour éviter les doublons
                const imgContainer = document.getElementById("img-container");
                imgContainer.innerHTML = "";
    
                const img = document.createElement("img");
                img.src = e.target.result;
                img.alt = "Uploaded Photo";
                imgContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
    
            // Cacher les éléments "picture-loaded"
            document.querySelectorAll(".picture-loaded").forEach((e) => (e.style.display = "none"));
        } else {
            alert("Veuillez sélectionner une image au format JPG ou PNG.");
        }
    });

    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("category");
    let titleValue = "";
    let selectedValue = null;

    titleInput.addEventListener("input", function () {
        titleValue = titleInput.value;
        checkFormValidity(); // Vérifie l'état du formulaire à chaque modification
    });

    categorySelect.addEventListener("change", function () {
        selectedValue = categorySelect.value;
        checkFormValidity(); // Vérifie l'état du formulaire à chaque modification
    });

    const addPictureForm = document.getElementById("addPhotoForm");
    const submitButton = addPictureForm.querySelector("input[type='submit']");

    // Fonction de validation des champs
    function validateTitle() {
        const titleError = document.getElementById("title-error");
        if (!titleValue) {
            titleError.textContent = "Le titre est requis.";
            return false;
        }
        titleError.textContent = "";
        return true;
    }

    function validateCategory() {
        const categoryError = document.getElementById("category-error");
        if (!selectedValue) {
            categoryError.textContent = "La catégorie est requise.";
            return false;
        }
        categoryError.textContent = "";
        return true;
    }

    function validateImage() {
        const imageError = document.querySelector(".image-error");
        const hasImage = document.querySelector("#img-container").firstChild;
        if (!hasImage) {
            imageError.textContent = "L'image est requise.";
            return false;
        }
        imageError.textContent = "";
        return true;
    }

    // Fonction pour vérifier si tous les champs sont valides
    function checkFormValidity() {
        const isTitleValid = validateTitle();
        const isCategoryValid = validateCategory();
        const isImageValid = validateImage();

        // Si tous les champs sont valides, active le bouton
        if (isTitleValid && isCategoryValid && isImageValid) {
            submitButton.style.backgroundColor = "black"; // Fond noir
            submitButton.disabled = false; // Active le bouton
        } else {
            submitButton.style.backgroundColor = "gray"; // Fond gris
            submitButton.disabled = true; // Désactive le bouton
        }
    }

    // Gérer l'envoi du formulaire
    addPictureForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Valider les champs avant de soumettre
        const isTitleValid = validateTitle();
        const isCategoryValid = validateCategory();
        const isImageValid = validateImage();

        if (isTitleValid && isCategoryValid && isImageValid) {
            const formData = new FormData();

            formData.append("image", file);
            formData.append("title", titleValue);
            formData.append("category", selectedValue);

            try {
                const response = await fetch("http://localhost:5678/api/works", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (response.status === 201) {
                    const data = await response.json();
                    console.log("Œuvre ajoutée avec succès :", data);
                    alert("Projet ajoutée !");
                    location.reload();
                } else {
                    const errorText = await response.text();
                    console.error("Erreur :", errorText);
                    alert(`Erreur lors de l'ajout du projet : ${errorText}`);
                }
            } catch (error) {
                console.error("Erreur réseau :", error.message);
                alert("Une erreur réseau s'est produite.");
            }
        } else {
            console.error("Tous les champs doivent être remplis correctement.");
            alert("Veuillez remplir tous les champs.");
        }
    });
}

function resetImageContainer() {
    // Vider le conteneur d'images uniquement si des enfants existent
    const imgContainer = document.getElementById("img-container");
    imgContainer.innerHTML = "";

    // Réafficher les éléments avec la classe "picture-loaded"
    document.querySelectorAll(".picture-loaded").forEach((element) => {
        element.style.display = "block";
    });
}