// Music player script
(() => {
  // Guard: Check if this page has player elements
  const hasPlayer = document.getElementById('audio') && document.getElementById('playlist');
  
  const audio = document.getElementById('audio');
  const title = document.getElementById('title');
  const artist = document.getElementById('artist');
  const cover = document.getElementById('cover');
  const playlistEl = document.getElementById('playlist');
  const playBtn = document.getElementById('play');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const currentTimeEl = document.getElementById('current');
  const durationEl = document.getElementById('duration');
  const seek = document.getElementById('seek');
  const volumeSlider = document.getElementById('volumeSlider');

  // Wait for FavoritesManager to be available
  const waitForFavoritesManager = () => {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.FavoritesManager) {
          clearInterval(checkInterval);
          console.log('✓ FavoritesManager initialized');
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('⚠ FavoritesManager not available, continuing without it');
        resolve();
      }, 3000);
    });
  };

  // Only initialize player controls if player elements exist
  if (hasPlayer && volumeSlider) {
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value / 100;
    });
  }

  // Fetch tracks from /songs endpoint
  let tracks = [];

  async function loadTracksFromServer() {
    try {
      const res = await fetch('/songs', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch songs');
      
      const ct = res.headers.get('content-type') || '';
      let files = [];
      
      if (ct.includes('application/json')) {
        files = await res.json();
      } else if (ct.includes('text/html')) {
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        files = Array.from(doc.querySelectorAll('a'))
          .map(a => a.getAttribute('href'))
          .filter(h => h && !h.endsWith('/') && !h.startsWith('?'));
      }
      
      if (!Array.isArray(files)) files = [];
      files = files
        .map(f => String(f).trim())
        .filter(f => f && /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f))
        .sort();
      
      // Convert files to track objects
      tracks = files.map((file, i) => ({
        title: decodeURIComponent(file),
        artist: 'Unknown Artist',
        file: '/songs/' + encodeURIComponent(file),
        cover: 'icon.png'
      }));
      
      console.log('Loaded', tracks.length, 'tracks from server');
      
      // Expose tracks globally for other pages to access
      window.allTracks = tracks;
      
      renderPlaylist();
      loadTrack(0);
    } catch (err) {
      console.error('Error loading tracks from server:', err);
      // Fallback to hardcoded tracks
      tracks = [
        {
          title: 'Sample Track 1',
          artist: 'Unknown Artist',
          file: 'songs/sample1.mp3',
          cover: 'icon.png'
        }
      ];
      renderPlaylist();
      loadTrack(0);
    }
  }

  let currentIndex = 0;
  let isPlaying = false;

  function renderPlaylist() {
    if (!playlistEl) return;
    playlistEl.innerHTML = '';
    tracks.forEach((t, i) => {
      const li = document.createElement('li');
      li.textContent = t.title;
      li.dataset.index = i;
      li.addEventListener('click', () => {
        loadTrack(i);
        play();
      });
      playlistEl.appendChild(li);
    });
  }

  function updatePlaylistUI() {
    if (!playlistEl) return;
    for (const li of playlistEl.querySelectorAll('li')) {
      li.classList.toggle('playing', Number(li.dataset.index) === currentIndex && isPlaying);
    }
  }

  function loadTrack(index) {
    currentIndex = Math.max(0, Math.min(index, tracks.length - 1));
    const t = tracks[currentIndex];
    if (audio) audio.src = t.file;
    title.textContent = t.title;
    artist.textContent = t.artist || '';
    cover.src = t.cover || 'icon.png';
    updatePlaylistUI();
    // reset progress
    seek.value = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '';
  }

  function play() {
    audio.play();
    isPlaying = true;
    playBtn.textContent = '⏸';
    updatePlaylistUI();
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '▶';
    updatePlaylistUI();
  }

  function togglePlay() {
    if (audio.paused) play(); else pause();
  }

  function next() {
    if (currentIndex < tracks.length - 1) loadTrack(currentIndex + 1);
    else loadTrack(0);
    play();
  }

  function prev() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else if (currentIndex > 0) {
      loadTrack(currentIndex - 1);
      play();
    } else {
      loadTrack(tracks.length - 1);
      play();
    }
  }

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const m = Math.floor(sec / 60);
    return `${m}:${s}`;
  }

  // Events
  if (hasPlayer) {
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration);
      seek.max = Math.floor(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      currentTimeEl.textContent = formatTime(audio.currentTime);
      if (!isSeeking) seek.value = Math.floor(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      next();
    });

    // Seek control
    let isSeeking = false;
    seek.addEventListener('input', (e) => {
      isSeeking = true;
      currentTimeEl.textContent = formatTime(e.target.value);
    });
    seek.addEventListener('change', (e) => {
      audio.currentTime = Number(e.target.value);
      isSeeking = false;
    });

    // Keyboard play/pause (space)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
      }
    });
  }

  // Sidebar interactivity: switch views and persist selection
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  const views = document.querySelectorAll('.view');

  function setActiveView(name) {
    sidebarBtns.forEach(b => b.classList.toggle('active', b.id === `btn-${name}`));
    views.forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
    try { localStorage.setItem('activeView', name); } catch (e) { /* ignore */ }
  }

  sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.id.replace('btn-', '');
      setActiveView(name);
    });
  });

  // restore last view or default to home
  const savedView = (function(){ try { return localStorage.getItem('activeView') } catch(e){ return null } })() || 'home';
  setActiveView(savedView);

  // Search functionality for browse view
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const clearBtn = document.getElementById('clear-search-btn');
  const searchResults = document.getElementById('search-results');

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML = '';
      renderSongsInView('browse-songs');
      return;
    }

    const filtered = tracks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      (t.artist && t.artist.toLowerCase().includes(query))
    );

    searchResults.innerHTML = '';
    if (filtered.length === 0) {
      searchResults.innerHTML = '<p>No songs found matching your search.</p>';
      return;
    }

    filtered.forEach((t, i) => {
      const trackIdx = tracks.indexOf(t);
      const card = document.createElement('div');
      card.className = 'song-card';
      card.innerHTML = `
        <img class="song-card-cover" src="${t.cover}" alt="${t.title}" />
        <div class="song-card-title">${t.title}</div>
        <div class="song-card-artist">${t.artist}</div>
        <button class="song-card-btn">▶ Play</button>
      `;
      card.querySelector('.song-card-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        loadTrack(trackIdx);
        play();
      });
      searchResults.appendChild(card);
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchResults.innerHTML = '';
      renderSongsInView('browse-songs');
    });
  }

  // Populate Browse and Library views with songs
  function renderSongsInView(viewId) {
    const container = document.getElementById(viewId);
    if (!container) return;
    container.innerHTML = '';
    tracks.forEach((t, i) => {
      const isFav = window.FavoritesManager && window.FavoritesManager.isFavorited(t.title);
      const card = document.createElement('div');
      card.className = 'song-card';
      card.innerHTML = `
        <img class="song-card-cover" src="${t.cover}" alt="${t.title}" />
        <div class="song-card-title">${t.title}</div>
        <div class="song-card-artist">${t.artist}</div>
        <div class="song-card-actions">
          <button class="song-card-btn play-btn">▶ Play</button>
          <button class="song-card-btn favorite-btn" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" data-track-title="${t.title}">
            ${isFav ? '★' : '☆'}
          </button>
        </div>
      `;
      card.querySelector('.play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        loadTrack(i);
        play();
      });
      
      const favBtn = card.querySelector('.favorite-btn');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!window.FavoritesManager) {
          console.error('FavoritesManager not available');
          return;
        }
        const trackTitle = t.title;
        if (window.FavoritesManager.isFavorited(trackTitle)) {
          window.FavoritesManager.removeFromFavorites(trackTitle);
          favBtn.textContent = '☆';
          favBtn.title = 'Add to favorites';
        } else {
          window.FavoritesManager.addToFavorites(trackTitle);
          favBtn.textContent = '★';
          favBtn.title = 'Remove from favorites';
        }
      });
      
      container.appendChild(card);
    });
  }

  // render songs in Browse and Library on page load
  function updateAllViews() {
    renderSongsInView('home-songs');
    renderSongsInView('browse-songs');
    renderSongsInView('library-songs');
  }

  // Initialize: load tracks from server, then render all views
  waitForFavoritesManager().then(() => {
    return loadTracksFromServer();
  }).then(() => {
    updateAllViews();
  });

  // auto preload first track (only if player exists)
  if (audio) audio.preload = 'metadata';
})();
