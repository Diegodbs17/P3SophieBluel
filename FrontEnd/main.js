// Variables Globales

let worksData = [];
const worksUrl = "http://localhost:5678/api/works";
const token = sessionStorage.token;

// Appels Function Globales

getWorks();
showEditBanner()
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
    const filteredWorks = category === "all" ?
        worksData :
        worksData.filter(work => work.category.name === category);
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

const openModal = function(e) {
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
    const modal2 = document.querySelector(".modal-wrapper-2");
    modal2.style.display = "none";
};

const closeModal = function(e) {
    if (modal === null || !modal.contains(e.target)) return;
    e.preventDefault();

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
    const hideModal = function() {
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
    resetForm()
};

const deleteBtn = function(e) {
    e.preventDefault();
    if (e.target.matches(".fa-trash-can")) {
        deleteWork(e.target.id);
    }
};

const stopPropagation = function(e) {
    e.stopPropagation()
}

const focusInModal = function(e) {
    e.preventDefault()
    let index = focusables.findIndex(f => f === modal.querySelector(":focus"))
    if (e.shiftKey === true) {
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

window.addEventListener("keydown", function(e) {
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
        e.preventDefault();
        const workId = deleteButton.getAttribute("data-id");
        await deleteWork(workId);
    });
    galleryModal.appendChild(figureModal);
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
    btnAdd.addEventListener("click", function() {
        modal2.style.display = "block";
        modal1.style.display = "none";
    });
}

// Retourner en arrière avec la Arrow Left
function previousModal() {
    const previousArrow = document.querySelector(".js-previous-modal");
    const modal2 = document.querySelector(".modal-wrapper-2");
    const modal1 = document.querySelector(".modal-wrapper");
    previousArrow.addEventListener("click", function() {
        modal1.style.display = "block";
        modal2.style.display = "none";
        resetForm()
    });
}

// Recupère les catégory pour l'input Select
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
    const fileInput = document.getElementById("file");
    let file;
    fileInput.style.display = "none";

    getCategorySelect();

    fileInput.addEventListener("change", function(event) {
        file = event.target.files[0];
        const maxFileSize = 4 * 1024 * 1024;

        if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
            if (file.size > maxFileSize) {
                alert("La taille de l'image ne doit pas dépasser 4 Mo.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const titleInput = document.getElementById("title");
                const imgContainer = document.getElementById("img-container");
                imgContainer.innerHTML = "";

                const img = document.createElement("img");
                img.src = e.target.result;
                img.alt = titleInput;
                imgContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
            document.querySelectorAll(".imgOnContainer").forEach((e) => (e.style.display = "none"));
        } else {
            alert("Veuillez sélectionner une image au format JPG ou PNG.");
        }
    });

    const addPictureForm = document.getElementById("addPhotoForm");

    // Ajoute une fonction pour vérifier les champs du formulaire
    function checkFormValidity() {
        const titleInput = document.getElementById("title");
        const categoryInput = document.getElementById("category");
        const submitButton = document.querySelector(".btnSubForm");
        const fileInput = document.getElementById("file");

        // Vérifier si tous les champs sont remplis
        if (titleInput.value !== "" && fileInput.files[0] && categoryInput.value !== "") {
            submitButton.style.backgroundColor = "#1D6154";
        } else {
            submitButton.style.backgroundColor = "#A7A7A7";
        }
    }

    // Fonction pour gérer les erreurs d'entrée
    function errorInput(event) {
        const titleInput = document.getElementById("title");
        const categoryInput = document.getElementById("category");
        const fileInput = document.getElementById("file");
        const error = document.querySelector(".errorInput")

        // Vérifier si les champs sont vides et afficher un message dans la console
        if (titleInput.value === "" || !fileInput.files[0] || categoryInput.value === "") {
            event.preventDefault();
            error.style.display = "block"
        }
    }

    // Vérification des champs à chaque modification
    document.getElementById("title").addEventListener("input", checkFormValidity);
    document.getElementById("category").addEventListener("change", checkFormValidity);
    document.getElementById("file").addEventListener("change", checkFormValidity);
    document.querySelector(".addPhotoForm").addEventListener("submit", errorInput);

    checkFormValidity();

    addPictureForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const titleInput = document.getElementById("title");
        const categoryInput = document.getElementById("category");

        // Créer un nouvel objet FormData
        const formData = new FormData();
        formData.append("title", titleInput.value);
        formData.append("category", categoryInput.value);
        formData.append("image", file);

        try {
            const response = await fetch(worksUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const newWorkData = await response.json();
                worksData.push(newWorkData);
                displayGalleryModal(worksData);
                displayGallery(worksData);
                alert("Projet Publié");
                const error = document.querySelector(".errorInput")
                resetForm()
            } else {
                console.error("Erreur lors de l'ajout du nouveau projet");
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi des données", error);
        }
    });
}

// Reset Formulaire
function resetForm() {
    const form = document.querySelector(".addPhotoForm")
    form.reset()
    document.getElementById("img-container").innerHTML = '';
    document.querySelectorAll(".imgOnContainer").forEach((e) => (e.style.display = "block"));
    const categorySelect = document.getElementById("category");
    categorySelect.value = "";
    const error = document.querySelector(".errorInput")
    error.style.display = "none"
    const submitButton = document.querySelector(".btnSubForm");
    submitButton.style.backgroundColor = "#A7A7A7";
}