const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/extract-profile', aiController.extractProfile);
router.post('/translate', aiController.translate);
router.post('/speak', aiController.speak);

module.exports = router;
