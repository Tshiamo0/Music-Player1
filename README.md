# Music Player

A full-featured web-based music player with song upload, search, favorites, and dynamic playlist management. Built with vanilla JavaScript, Express.js, and localStorage persistence.

## Features

- **🎵 Music Playback** — Play, pause, next, previous, seek, and volume control
- **📤 Upload Songs** — Add audio files to the library via the web interface
- **🔍 Search & Browse** — Filter songs by title or artist in real-time
- **⭐ Favorites** — Save favorite songs with persistent browser storage
- **📱 Responsive Design** — Works on desktop and mobile devices
- **🎨 Clean UI** — Intuitive sidebar navigation and song grids

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm

### Installation & Running

```powershell
# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:3000`

## Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `http://localhost:3000` | Main player with playlist and playback controls |
| **Browse** | `http://localhost:3000/index.html` (Browse tab) | Search and filter songs by title/artist |
| **Library** | `http://localhost:3000/library.html` | Upload new audio files to `songs/` folder |
| **Favorites** | `http://localhost:3000/favorites.html` | View and manage saved favorite songs |

## How to Use

### 🏠 Home Page
1. View all available songs in the main playlist
2. Click on any song to select it
3. Use the player controls:
   - **▶ Play** — Start playback
   - **⏸ Pause** — Pause the current track
   - **⏭ Next** — Skip to the next song
   - **⏮ Previous** — Go back to the previous song
   - **Seek Bar** — Jump to any point in the track
   - **Volume Slider** — Adjust playback volume

### 🔍 Browse
1. Enter a song title or artist name in the search box
2. Results filter in real-time
3. Click **▶ Play** to play a song
4. Click **★** to add/remove from favorites

### 📚 Library
1. Click **Choose File** and select an audio file (MP3, WAV, OGG, M4A, FLAC, AAC)
2. Click **Upload** to add the song to the `songs/` folder
3. The song will immediately appear in all views

### ⭐ Favorites
1. On any page, click the **★** button on a song to add it to favorites
2. Click the **☆** button to remove it from favorites
3. Go to the **Favorites** page to view all saved songs
4. Click **✕ Remove** to delete from favorites, or **▶ Play** to play

## Technical Details

### Project Structure
```
new-site/
├── index.html              # Home page (player + browse + library inline)
├── library.html            # Library page (upload interface)
├── favorites.html          # Favorites page
├── 404.html               # Error page
├── server.js              # Express.js backend
├── package.json           # Dependencies
├── js/
│   ├── app.js            # Main player logic
│   └── favorites.js      # Favorites management
├── css/
│   ├── style.css         # Main styles
│   ├── library.css       # Library page styles
│   └── favorites.css     # Favorites page styles
├── songs/                # Audio files directory
└── img/                  # Image assets
```

### Backend API

**GET `/songs`**
- Returns a JSON array of available audio files
- Example: `["song1.mp3", "song2.mp3"]`

**POST `/upload`**
- Accepts multipart form data with audio file
- Saves to `songs/` folder
- Returns upload status

### Data Storage

- **Server-side** — Audio files stored in `songs/` folder
- **Client-side** — Favorite songs stored in browser localStorage under key `musicPlayerFavorites`

## Supported Audio Formats
- MP3
- WAV
- OGG
- M4A
- FLAC
- AAC

## Notes

- Favorites are stored locally in your browser and will persist across sessions
- To share favorites across devices, export from browser DevTools > Application > LocalStorage
- The server dynamically scans the `songs/` folder for available tracks
- No database required — fully serverless on the frontend (except file upload)

## Troubleshooting

**Server won't start**
- Ensure port 3000 is not in use: `Get-Process -Name node | Stop-Process -Force`
- Run `npm install` to ensure dependencies are installed

**Songs not appearing**
- Check that audio files are in the `songs/` folder
- Verify file extensions are supported (MP3, WAV, OGG, M4A, FLAC, AAC)
- Refresh the page (Ctrl+R)

**Favorites not showing**
- Open browser DevTools (F12) and check the Console for errors
- Verify localStorage is enabled in your browser
- Clear cache if needed

Enjoy your music! 🎵