const express = require('express');
const router = express.Router();

const Scraper = require('./utils/image-scrapper');
const google = new Scraper({
    puppeteer: {
        headless: false,
    },
});

/* GET lunch detector. */
router.get('/', async (req, res, next) => {
    const type = req.query.type;

    if (type) {
        const result = await google.scrape(type, 100);
        const choice = result[Math.floor(Math.random() * result.length)];
        return res.send(JSON.stringify(choice));
    }

    res.render('images', { title: 'Food Detector' });
});

module.exports = router;