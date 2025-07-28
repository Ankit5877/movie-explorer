const API_URL = "http://www.omdbapi.com/?i=tt3896198&apikey=554b6635";
const API_KEY ="554b6635"

const searchInput = document.getElementById("searchInput");
const moviesContainer = document.getElementById("moviesContainer");
const loader = document.getElementById("loader");
const modal = document.getElementById("modal");
const modalDetails = document.getElementById("modalDetails");
const closeModal = document.querySelector(".close");
const toggleBtn = document.getElementById("toggleFavorites");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let showFavorites = false;
let debounceTimeout;

// 🔍 Debounce Search
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (!showFavorites) searchMovies(searchInput.value.trim());
  }, 500);
});

// 🔁 Search with API and fallback
async function searchMovies(query) {
  loader.classList.remove("hidden");
  moviesContainer.innerHTML = "";

  try {
    const res = await fetch(API_URL + encodeURIComponent(query));
    const data = await res.json();

    if (data.Response === "True") {
      renderMovies(data.Search);
    } else {
      throw new Error("API failed");
    }
  } catch (err) {
    console.warn("OMDb failed, using fallback.json");
    try {
      const fallback = await fetch("fallback.json");
      const fallbackData = await fallback.json();
      const filtered = fallbackData.filter(movie =>
        movie.Title.toLowerCase().includes(query.toLowerCase())
      );
      renderMovies(filtered);
    } catch (e) {
      moviesContainer.innerHTML = "<p>Could not load fallback data.</p>";
    }
  } finally {
    loader.classList.add("hidden");
  }
}

// 🖼️ Render Movies
function renderMovies(movies) {
  if (!movies.length) {
    moviesContainer.innerHTML = "<p>No movies found.</p>";
    return;
  }

  moviesContainer.innerHTML = "";
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    const poster = movie.Poster !== "N/A" ? movie.Poster : "assets/placeholder.png";

    card.innerHTML = `
      <img src="${poster}" alt="Poster" />
      <h3>${movie.Title}</h3>
      <button onclick='openModal(${JSON.stringify(movie)})'>View Details</button>
    `;
    moviesContainer.appendChild(card);
  });
}

// 🔍 Modal Details
async function openModal(movie) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
    const fullData = await res.json();

    modalDetails.innerHTML = `
      <img src="${fullData.Poster}" style="width: 100%;" />
      <h2>${fullData.Title}</h2>
      <p><strong>Year:</strong> ${fullData.Year}</p>
      <p><strong>Genre:</strong> ${fullData.Genre}</p>
      <p>${fullData.Plot}</p>
      <button onclick='${isFavorite(fullData) ? `removeFromFavorites("${fullData.imdbID}")` : `addToFavorites(${JSON.stringify(fullData)})`}'>
        ${isFavorite(fullData) ? "Remove from Favorites" : "Add to Favorites"}
      </button>
    `;
    modal.classList.remove("hidden");
  } catch {
    alert("Failed to load movie details.");
  }
}

closeModal.onclick = () => modal.classList.add("hidden");
modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };

// ⭐ Favorite Logic
function isFavorite(movie) {
  return favorites.some(f => f.imdbID === movie.imdbID);
}

function addToFavorites(movie) {
  if (!isFavorite(movie)) {
    favorites.push(movie);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    modal.classList.add("hidden");
  }
}

function removeFromFavorites(id) {
  favorites = favorites.filter(f => f.imdbID !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  modal.classList.add("hidden");
  if (showFavorites) renderMovies(favorites);
}

// 🔄 Toggle Favorites
toggleBtn.onclick = () => {
  showFavorites = !showFavorites;
  toggleBtn.textContent = showFavorites ? "Back to Search" : "Show Favorites";
  searchInput.disabled = showFavorites;

  if (showFavorites) {
    if (favorites.length === 0) {
      moviesContainer.innerHTML = "<p>No favorites yet.</p>";
    } else {
      renderMovies(favorites);
    }
  } else {
    moviesContainer.innerHTML = "";
  }
};