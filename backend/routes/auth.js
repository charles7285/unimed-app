const express = require('express');
const router = express.Router();

// This file is for future route organization
// Currently all routes are in server.js for simplicity

router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working!' });
});

module.exports = router;