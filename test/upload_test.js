const request = require('supertest');
const path = require('path');
const app = require('../server');

(async () => {
  try {
    const filePath = path.join(__dirname, '..', 'dummy.mp3');
    const res = await request(app)
      .post('/upload')
      .attach('file', filePath);

    console.log('STATUS:', res.status);
    console.log('BODY:', res.body);

    // Expect server to return original filename (no unique prefix or sanitization)
    console.log('EXPECTED filename:', path.basename(filePath));
    console.log('RETURNED filename:', res.body.filename);

    // verify /api/songs
    const listRes = await request(app).get('/api/songs');
    console.log('SONGS (first 10):', listRes.body.slice(0, 10));

    // verify uploaded file is served
    const served = await request(app).get('/songs/' + res.body.filename);
    console.log('SERVED STATUS:', served.status, 'CONTENT-TYPE:', served.headers['content-type']);

    // Now test FLAC upload (copy dummy.mp3 to dummy.flac in test folder)
    const fs = require('fs');
    const flacPath = path.join(__dirname, '..', 'dummy.flac');
    try{ fs.copyFileSync(filePath, flacPath); }catch(e){}
    const resFlac = await request(app).post('/upload').attach('file', flacPath);
    console.log('FLAC STATUS:', resFlac.status, 'BODY:', resFlac.body);
    try{ fs.unlinkSync(flacPath); }catch(e){}
  } catch (err) {
    console.error('ERROR:', err.message);
    console.error(err.stack);
  }
})();
