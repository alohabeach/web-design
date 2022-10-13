const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('artist');
});

router.post('/api/post', (req, res, next) => {

});

module.exports = router;