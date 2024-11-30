async function getWorks() {
    const worksUrl = "http://localhost:5678/api/works"
    try {
        const response = await fetch(worksUrl);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const json = await response.json()
        for (let i = 0; i < json.length; i++) {
            createFigure(json[i])
        }
    } catch (error) {
        console.error(error.message)
    }
}
getWorks()

function createFigure(jsonData) {
    const figureElement = document.createElement("figure")
    const imgElement = document.createElement("img")
    imgElement.src = jsonData.imageUrl
    imgElement.alt = jsonData.title
    const figcaptionElement = document.createElement("figcaption")
    figcaptionElement.innerText = jsonData.title
    const sectionGallery = document.querySelector(".gallery")
    sectionGallery.appendChild(figureElement)
    figureElement.appendChild(imgElement)
    figureElement.appendChild(figcaptionElement)
}