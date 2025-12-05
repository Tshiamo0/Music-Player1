// Favorites management script
(() => {
  const STORAGE_KEY = 'musicPlayerFavorites';
  const favoritesContainer = document.getElementById('favorites-list');
  const favoritesDescription = document.getElementById('favorites-description');

  // Get all favorites from localStorage
  function getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading favorites:', e);
      return [];
    }
  }

  // Save favorites to localStorage
  function saveFavorites(favorites) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  }

  // Add a song to favorites
  function addToFavorites(trackTitle) {
    const favorites = getFavorites();
    if (!favorites.includes(trackTitle)) {
      favorites.push(trackTitle);
      saveFavorites(favorites);
      console.log('Added to favorites:', trackTitle);
    }
  }

  // Remove a song from favorites
  function removeFromFavorites(trackTitle) {
    const favorites = getFavorites();
    const index = favorites.indexOf(trackTitle);
    if (index > -1) {
      favorites.splice(index, 1);
      saveFavorites(favorites);
      console.log('Removed from favorites:', trackTitle);
    }
  }

  // Check if a song is in favorites
  function isFavorited(trackTitle) {
    return getFavorites().includes(trackTitle);
  }

  // Render favorites display
  function renderFavorites(tracks) {
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
      favoritesDescription.textContent = 'No favorite songs yet. Add songs to your favorites on the home page!';
      favoritesContainer.innerHTML = '';
      return;
    }

    favoritesDescription.textContent = `You have ${favorites.length} favorite song(s).`;
    favoritesContainer.innerHTML = '';

    // Find and display favorited tracks
    favorites.forEach(favTitle => {
      const track = tracks.find(t => t.title === favTitle);
      if (track) {
        const trackIdx = tracks.indexOf(track);
        const card = document.createElement('div');
        card.className = 'song-card favorite-card';
        card.innerHTML = `
          <img class="song-card-cover" src="${track.cover}" alt="${track.title}" />
          <div class="song-card-title">${track.title}</div>
          <div class="song-card-artist">${track.artist}</div>
          <div class="song-card-actions">
            <button class="song-card-btn play-btn">▶ Play</button>
            <button class="song-card-btn remove-btn">✕ Remove</button>
          </div>
        `;
        
        card.querySelector('.play-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          // Dispatch custom event to play the track
          window.dispatchEvent(new CustomEvent('playTrack', { detail: { index: trackIdx } }));
        });

        card.querySelector('.remove-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          removeFromFavorites(track.title);
          renderFavorites(tracks);
        });

        favoritesContainer.appendChild(card);
      }
    });
  }

  // Make functions globally accessible
  window.FavoritesManager = {
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    getFavorites,
    renderFavorites,
    saveFavorites
  };

  // Listen for page load and render favorites when tracks are ready
  const checkTracksAndRender = () => {
    // Wait for app.js to load tracks (max 10 seconds)
    let attempts = 0;
    const maxAttempts = 50; // 50 * 200ms = 10 seconds
    
    const interval = setInterval(() => {
      attempts++;
      if (window.allTracks && Array.isArray(window.allTracks) && window.allTracks.length > 0) {
        clearInterval(interval);
        console.log('✓ Rendering favorites with', window.allTracks.length, 'total tracks');
        console.log('Favorites saved:', window.FavoritesManager.getFavorites());
        renderFavorites(window.allTracks);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('⚠ Timeout waiting for tracks. Tracks:', window.allTracks);
      }
    }, 200);
  };

  // Listen for playTrack events from favorites page
  window.addEventListener('playTrack', (e) => {
    const trackIdx = e.detail && e.detail.index;
    if (typeof trackIdx === 'number' && window.allTracks) {
      // Navigate back to home and trigger play
      const homeBtn = document.querySelector('#btn-home');
      if (homeBtn) {
        homeBtn.click();
        // Dispatch event to main player to load and play
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('loadAndPlay', { detail: { index: trackIdx } }));
        }, 100);
      }
    }
  });

  checkTracksAndRender();
})();

