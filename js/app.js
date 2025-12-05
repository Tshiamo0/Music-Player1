// Music player script
(() => {
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

  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
  });

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
    for (const li of playlistEl.querySelectorAll('li')) {
      li.classList.toggle('playing', Number(li.dataset.index) === currentIndex && isPlaying);
    }
  }

  function loadTrack(index) {
    currentIndex = Math.max(0, Math.min(index, tracks.length - 1));
    const t = tracks[currentIndex];
    audio.src = t.file;
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

  // Populate Browse and Library views with songs
  function renderSongsInView(viewId) {
    const container = document.getElementById(viewId);
    if (!container) return;
    container.innerHTML = '';
    tracks.forEach((t, i) => {
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
        loadTrack(i);
        play();
      });
      container.appendChild(card);
    });
  }

  // render songs in Browse and Library on page load
  function updateAllViews() {
    renderSongsInView('browse-songs');
    renderSongsInView('library-songs');
  }

  // Initialize: load tracks from server, then render all views
  loadTracksFromServer().then(() => {
    updateAllViews();
  });

  // auto preload first track
  audio.preload = 'metadata';
})();
