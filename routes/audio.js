const express = require('express');
const router = express.Router();
const Spotify = require('./utils/spotify-api');
const spotify = new Spotify();
const path = require('path');
const fs = require('fs');

router.get('/', (req, res, next) => {
    res.render('audio');
});

router.get('/api/search', async (req, res, next) => {
    if (!req.query.q) return res.status(400).json();

    const results = await spotify.search(req.query.q, 1);
    res.json(results);
});

router.get('/api/download', async (req, res, next) => {
    if (!req.query.songName || !req.query.artistName) return res.status(400).json();

    try {
        const filePath = await spotify.download(req.query.songName, req.query.artistName).catch(console.error);

        let audioName = filePath.split('\\');
        audioName = audioName[audioName.length - 1];

        res.json({ fileName: audioName });
    } catch (e) {
        console.error(e);
        res.status(500).json();
    }
});

router.post('/api/delete', (req, res, next) => {
    const src = req.body.source;
    if (!src) return res.status(400).json();

    try {
        let audioName = src.split('/');
        audioName = audioName[audioName.length - 1];

        fs.unlinkSync(path.resolve(__dirname, `../public/audios/${audioName}`));
        res.status(200).json();
    } catch (e) {
        console.error(e);
        res.status(500).json();
    }
});

module.exports = router;