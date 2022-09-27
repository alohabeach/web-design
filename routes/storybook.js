const express = require('express');
const router = express.Router();

/* GET storybook page. */
router.get('/', (req, res, next) => {
    res.render('storybook');
});

module.exports = router;