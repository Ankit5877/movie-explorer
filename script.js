const API_URL = "http://www.omdbapi.com/?i=tt3896198&apikey=554b6635";
const API_KEY ="554b6635"

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('results');
  const loader = document.getElementById('loader');
  const modal = document.getElementById('modal');
  const modalDetails = document.getElementById('modalDetails');
  const closeModal = document.querySelector('.close');
  const toggleFavoritesBtn = document.getElementById('toggleFavorites');

  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  let isShowingFavorites = false;
  let debounceTimeout;

  async function fetchMovies(query) {
    loader.classList.remove('hidden');
    try {
      const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=554b6635=${query}`);
      const data = await res.json();
      if (data.Response === 'True') return data.Search;
      else throw new Error('Fallback to JSON');
    } catch {
      const fallback = await fetch('fallback.json');
      const data = await fallback.json();
      return data.filter(movie =>
        movie.Title.toLowerCase().includes(query.toLowerCase())
      );
    } finally {
      loader.classList.add('hidden');
    }
  }

  function renderMovies(movies) {
    resultsContainer.innerHTML = '';
    if (movies.length === 0) {
      resultsContainer.innerHTML = '<p>No movies found.</p>';
      return;
    }

    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <img src="${movie.Poster}" alt="${movie.Title}" />
        <h3>${movie.Title}</h3>
        <button data-id="${movie.imdbID}" class="view-details">View Details</button>
      `;
      resultsContainer.appendChild(card);
    });
  }

  async function showDetails(id) {
    try {
      const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=554b6635=${id}&plot=short`);
      const movie = await res.json();
      modalDetails.innerHTML = `
        <img src="${movie.Poster}" />
        <h2>${movie.Title}</h2>
        <p><strong>Year:</strong> ${movie.Year}</p>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p>${movie.Plot}</p>
        <button id="favBtn">${favorites.some(f => f.imdbID === id) ? 'Remove from Favorites' : 'Add to Favorites'}</button>
      `;
      document.getElementById('favBtn').onclick = () => toggleFavorite(movie);
      modal.classList.remove('hidden');
    } catch {
      alert('Error loading details.');
    }
  }

  function toggleFavorite(movie) {
    const index = favorites.findIndex(f => f.imdbID === movie.imdbID);
    if (index !== -1) favorites.splice(index, 1);
    else favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    modal.classList.add('hidden');
    if (isShowingFavorites) renderMovies(favorites);
  }

  function debounceSearch(e) {
    const query = e.target.value.trim();
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      if (!query) return;
      const movies = await fetchMovies(query);
      renderMovies(movies);
    }, 500);
  }

  function toggleFavorites() {
    isShowingFavorites = !isShowingFavorites;
    toggleFavoritesBtn.textContent = isShowingFavorites ? 'Back to Search' : 'Show Favorites';
    resultsContainer.innerHTML = '';
    if (isShowingFavorites) {
      renderMovies(favorites);
    }
  }

  closeModal.onclick = () => modal.classList.add('hidden');
  modal.onclick = e => {
    if (e.target === modal) modal.classList.add('hidden');
  };

  searchInput.addEventListener('input', debounceSearch);
  resultsContainer.addEventListener('click', e => {
    if (e.target.classList.contains('view-details')) {
      const id = e.target.dataset.id;
      showDetails(id);
    }
  });
  toggleFavoritesBtn.addEventListener('click', toggleFavorites);
});
