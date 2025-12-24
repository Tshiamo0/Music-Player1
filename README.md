# Music Player 🎧

A lightweight web-based music player with file uploads, search, favorites, and a simple Express.js backend. Built with vanilla JavaScript and localStorage for client-side persistence.

---

## ✅ Key Features

- **Playback controls** (play, pause, next, previous, seek, volume)
- **Upload songs** via the web UI or the `/upload` API endpoint
- **Real-time search** and browsing by title/artist
- **Favorites** saved in browser `localStorage`
- **Responsive UI** for desktop and mobile

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm

### Install & Run

```powershell
# Install dependencies
npm install

# Start the development server
npm start
```

By default the server serves the app at `http://localhost:3000`.

You can override the port or songs folder with environment variables:
- `PORT` (default: 3000)
- `SONGS_DIR` (default: `./songs`)

Example (PowerShell):
```powershell
$env:PORT = 4000; npm start
```

---

## 🧪 Tests

Run the project tests with:

```bash
npm test
```

Tests are implemented with **Jest** and **supertest** and live in the `test/` folder.

---

## 📄 API

### GET /api/songs
Returns a JSON array of filenames for supported audio files found in the `songs/` directory.

Example response:

```json
["song1.mp3", "song2.flac"]
```

### POST /upload
Accepts multipart form uploads (field name: `file`).

- Allowed extensions: **.mp3, .wav, .ogg, .m4a, .flac, .aac**
- Max file size: **100 MB**
- Filenames are saved as uploaded (the server currently does not add a unique prefix or sanitize names beyond using the basename)

Example curl upload:

```bash
curl -v -F "file=@song.mp3" http://localhost:3000/upload
```

If an upload fails, the server returns a 400 status with a JSON error message.

---

## ⚠️ Important Notes & Security

- Filenames are saved using the uploaded name. Be cautious when accepting uploads from untrusted sources.
- The server filters by file extension and MIME type but **does not** perform deep content scanning.
- Consider adding filename sanitization or unique prefixes for production use.

---

## 📁 Project Structure

```
new-site/
├── index.html
├── library.html
├── 404.html
├── server.js
├── package.json
├── js/
├── css/
├── songs/         # uploaded audio files
└── test/          # Jest tests
```

---

## Contributing

Contributions are welcome — open an issue or submit a pull request. Please include a clear description of the change and add tests when appropriate.

---

## License

MIT — feel free to use or modify.

---

Enjoy your music! 🎵
