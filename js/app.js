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

  // Add tracks to the playlist. You can add more here or generate them dynamically
  const tracks = [
    {
      title: 'Travis Scott - HIGHEST IN THE ROOM',
      artist: 'Travis Scott',
      file: 'songs/Travis Scott - HIGHEST IN THE ROOM (Official Music Video).mp3',
      cover: 'icon.png'
    },

    {
        title: 'Ed Sheeran - Shape of You',
        artist: 'Ed Sheeran',
        file:'songs/Ed Sheeran - Shape of You.mp3',
        cover: 'icon.png'
    },

    {
        title:'Luis Fonsi - Despacito ft. Daddy Yankee',
        artist:'Luis Fonsi',
        file:'songs/Luis Fonsi - Despacito ft. Daddy Yankee.mp3',
        cover:'icon.png'
    }

  ];

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

  // Initialize
  renderPlaylist();
  loadTrack(0);
  // auto preload first track
  audio.preload = 'metadata';
})();