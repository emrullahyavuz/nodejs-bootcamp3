const express = require('express');
const router = express.Router();
const path = require('path');

/**
 * @route   GET /chat
 * @desc    Chat sayfasını göster
 * @access  Public
 */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/chat.html'));
});

module.exports = router; 