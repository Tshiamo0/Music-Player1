const fs = require('fs');
const path = require('path');
const os = require('os');
const request = require('supertest');

// Create a temporary songs directory BEFORE requiring the app so server picks it up
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'music-player-test-'));
process.env.SONGS_DIR = tmpDir;

const app = require('../server');

afterAll(() => {
  // Cleanup temp dir
  try {
    fs.readdirSync(tmpDir).forEach(f => fs.unlinkSync(path.join(tmpDir, f)));
    fs.rmdirSync(tmpDir);
  } catch (e) {
    // ignore
  }
});

describe('Upload validations and API', () => {
  test('rejects invalid file type', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('hello'), 'readme.txt');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.toLowerCase()).toContain('invalid file type');
  });

  test('accepts valid mp3 and exposes it via /api/songs', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('fake_mp3'), { filename: 'track.mp3', contentType: 'audio/mpeg' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'File uploaded');
    expect(res.body).toHaveProperty('filename');

    const files = fs.readdirSync(tmpDir);
    expect(files.length).toBeGreaterThan(0);

    const list = await request(app).get('/api/songs');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    // Ensure uploaded file is present in the listing
    const uploadedName = res.body.filename;
    expect(list.body).toContain(uploadedName);
  });

  test('rejects files that are too large', async () => {
    // create ~26MB buffer
    const big = Buffer.alloc(26 * 1024 * 1024, 'a');
    const res = await request(app)
      .post('/upload')
      .attach('file', big, { filename: 'big.mp3', contentType: 'audio/mpeg' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.toLowerCase()).toContain('file too large');
  }, 20000);
});
