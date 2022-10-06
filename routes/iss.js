const express = require('express');
const router = express.Router();
const dataStore = require('nedb');
const db = new dataStore('database.db');
db.loadDatabase();

router.get('/', (req, res, next) => {
    res.render('iss');
});

router.post('/api', (req, res, next) => {
    res.json({ status: 'success' });
});

module.exports = router;