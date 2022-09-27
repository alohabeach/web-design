const express = require('express');
const router = express.Router();

/* GET numbers game. */
router.get('/', (req, res, next) => {
    res.render('numbers', { title: 'Shape Thingy' });
});

module.exports = router;