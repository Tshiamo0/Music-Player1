const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure songs directory exists
const SONGS_DIR = path.join(__dirname, 'songs');
if (!fs.existsSync(SONGS_DIR)) fs.mkdirSync(SONGS_DIR, { recursive: true });

// Serve site files
app.use(express.static(path.join(__dirname)));

// Serve uploaded songs statically at /songs
app.use('/songs', express.static(SONGS_DIR));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, SONGS_DIR);
  },
  filename: function (req, file, cb) {
    // keep original filename; in real apps sanitize names to avoid collisions
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ message: 'File uploaded', filename: req.file.filename });
});

// Return JSON list of files in songs folder
app.get('/songs', (req, res) => {
  fs.readdir(SONGS_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read songs folder' });
    // Filter out hidden files (optional)
    const list = files.filter(f => !f.startsWith('.'));
    res.json(list);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
