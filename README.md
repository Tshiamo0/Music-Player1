# Music Player

This is a simple static music player built with HTML, CSS, and plain JavaScript. It supports basic playback features (play/pause, previous, next), a playlist, and a progress bar.

## How it works
- Tracks are defined in `js/app.js` within the `tracks` array. Add more track objects to the array using `{ title, artist, file, cover }`.
 - New features: Volume slider + mute button, and Repeat modes (off | all | one). Use the repeat button to cycle modes and the volume slider to set volume.
- Place audio files in the `songs/` folder and reference them using `songs/<filename>.mp3`.

## Run locally
You can use `npm start` to run the webpack dev server:

```powershell
npm install
npm start
```

This will open the site in your default browser.

## Adding songs
- Add a song file to the `songs/` folder.
- Add an entry in `js/app.js` `tracks` array with file path and title; if you want to add multiple tracks, add multiple objects.

Example:

```js
{ title: 'My Song', artist: 'My Artist', file: 'songs/my-song.mp3', cover: 'img/cover.jpg' }
```

## Notes
- To generate a dynamic playlist from a folder on the server you would need a build step / server or publish JSON with the list of files; this is a static example for local environments.

Enjoy! 🎵
