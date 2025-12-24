const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// filename sanitization and uniqueness removed per request

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure songs directory exists (allow overriding via env for tests)
const SONGS_DIR = process.env.SONGS_DIR ? path.resolve(process.env.SONGS_DIR) : path.join(__dirname, 'songs');
if (!fs.existsSync(SONGS_DIR)) fs.mkdirSync(SONGS_DIR, { recursive: true });

// Serve site files
app.use(express.static(path.join(__dirname)));

// Serve uploaded songs statically at /songs
app.use('/songs', express.static(SONGS_DIR));

// Multer setup with validation and sanitisation
const ALLOWED_EXTS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
const ALLOWED_MIMETYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/mp4', 'audio/flac', 'audio/aac', 'audio/x-flac'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, SONGS_DIR);
  },
  filename: function (req, file, cb) {
    // Use the uploaded filename as-is (basename only) — no sanitization or uniqueness prefix applied
    cb(null, path.basename(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter
});

// Upload endpoint with explicit multer invocation so we can handle errors & cleanup
app.post('/upload', (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      // Multer errors have a .code property; general errors from fileFilter will be Error
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Upload error' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // No filename sanitization/safety check enforced; return the saved filename

    res.json({ message: 'File uploaded', filename: req.file.filename });
  });
});

// Return JSON list of files in songs folder (API endpoint)
app.get('/api/songs', (req, res) => {
  fs.readdir(SONGS_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read songs folder' });
    // Filter out hidden files and only return allowed extensions
    const list = files.filter(f => !f.startsWith('.') && ALLOWED_EXTS.includes(path.extname(f).toLowerCase()));
    res.json(list);
  });
});

// If this file is run directly, start the server. When required (for tests), export the app.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
