const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

router.post('/register', workerController.register);
router.get('/:kaamId', workerController.getWorker);

module.exports = router;
