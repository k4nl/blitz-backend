const express = require('express');

const router = express.Router();

const userControllers = require('../controllers/userControllers');

router.post('/sign', userControllers.createUser);
router.post('/', userControllers.login);

module.exports = router;