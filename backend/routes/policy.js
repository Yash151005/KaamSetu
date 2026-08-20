const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');

router.get('/stats', policyController.getStats);
router.post('/generate-brief', policyController.generateBrief);
router.get('/heatmap-data', policyController.getHeatmapData);

module.exports = router;
