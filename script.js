let API_BASE_URL = "https://localhost:8000/firebase";

const validUserIds = [
    "0yXlboLdnDVDCGUpiu0ZoF8Y5Lz2",
    "JVuTsb5KtneRPVXEEbgryhZJ0Spx",
    "AoAu4gsyB8ohM8uJe3Kxt7OyePIi",
    "MlvRKPWReWdFKEd07j8RycLpfrwZ",
    "2pUZm1tnYcWrP8lbKxe7iVJMHubW",
    "8AmD58UCEd8euzQvU72a6QchZFQ4"
];

function validateLogin() {
    const userIdInput = document.getElementById("userIdInput").value.trim();
    const urlInput = document.getElementById("urlInput").value.trim();
    const errorElement = document.getElementById("error");

    if (!validUserIds.includes(userIdInput)) {
        errorElement.innerText = "Invalid User ID. Try again.";
        return;
    }

    if (!urlInput.startsWith("http")) {
        errorElement.innerText = "Invalid URL. It must start with http or https.";
        return;
    }

    API_BASE_URL = urlInput.endsWith("/firebase") ? urlInput : urlInput + "/firebase";

    localStorage.setItem("loggedInUser", userIdInput);
    localStorage.setItem("apiBaseUrl", API_BASE_URL);

    console.log("API Url:", API_BASE_URL);

    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
    fetchImage().then(r => console.log("Initial Image Fetched"));
}

let selectedGender = "Female";
let currentImageId = null;

const femaleOption = document.getElementById("femaleOption");
const maleOption = document.getElementById("maleOption");
const likeButton = document.getElementById("likeButton");
const dislikeButton = document.getElementById("dislikeButton");
const skipButton = document.getElementById("skipButton");
const imageContainer = document.getElementById("imageContainer");

femaleOption.addEventListener("click", () => {
    selectedGender = "Female";
    updateGenderSelection();
});

maleOption.addEventListener("click", () => {
    selectedGender = "Male";
    updateGenderSelection();
});

function updateGenderSelection() {
    document.getElementById("femaleOption").classList.toggle("selected-female", selectedGender === "Female");
    document.getElementById("maleOption").classList.toggle("selected-male", selectedGender === "Male");
}

async function fetchImage() {
    try {
        disableButtons(true);

        const userId = localStorage.getItem("loggedInUser");

        console.log("Using User ID:", userId);

        const queryParams = new URLSearchParams({
            user: userId,
            batch: 1,
            gender: selectedGender
        });

        console.log("Fetching from API:", `${API_BASE_URL}/random?${queryParams}`);

        const response = await fetch(`${API_BASE_URL}/random?${queryParams}`, {
            headers: {
                "X-Pinggy-No-Screen": "true",
            }
        });

        console.log("Raw Response:", response);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("API Data:", data);

        const imageUrls = data.images;

        if (imageUrls && imageUrls.length > 0) {
            const url = imageUrls[0];
            currentImageId = url.split("/").pop().split("?")[0];
            imageContainer.innerHTML = `<img src="${url}" alt="Fetched Image">`;
        } else {
            imageContainer.innerHTML = `<p>No images found.</p>`;
            currentImageId = null;
        }

        disableButtons(false);
    } catch (error) {
        console.error("Error fetching image:", error);
        imageContainer.innerHTML = `<p>Error fetching image.</p>`;
        disableButtons(true);
    }
}

function likeImage() {
    if (!currentImageId) return;
    sendFeedback("like").then(r => console.log("Like Sent"));
}

function dislikeImage() {
    if (!currentImageId) return;
    sendFeedback("dislike").then(r => console.log("Dislike Sent"));
}

async function sendFeedback(action) {
    const userId = localStorage.getItem("loggedInUser");
    const queryParams = new URLSearchParams({
        user_id: userId,
        image_id: currentImageId
    });

    try {
        const response = await fetch(`${API_BASE_URL}/${action}?${queryParams}`, {
            headers: {
                "X-Pinggy-No-Screen": "true",
            },
            method: "POST"
        });

        if (response.ok) {
            console.log(`${action.toUpperCase()}:`, currentImageId);
            await fetchImage();
        }
    } catch (error) {
        console.error(`Error ${action}ing image:`, error);
    }
}

function disableButtons(disable) {
    [likeButton, dislikeButton].forEach(btn => {
        btn.disabled = disable || !currentImageId;
        btn.classList.toggle("disabled", disable || !currentImageId);
    });
}

likeButton.addEventListener("click", likeImage);
dislikeButton.addEventListener("click", dislikeImage);
skipButton.addEventListener("click", fetchImage);

window.onload = function () {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser && validUserIds.includes(loggedInUser)) {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("appContainer").style.display = "flex";
        fetchImage().then(r => console.log("Image Fetched"));
    }
};

