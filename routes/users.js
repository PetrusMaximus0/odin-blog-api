const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//
router.get('/', userController.login_index);
//
router.get('/login', userController.login_get);
//
router.post('/login', userController.login_post);

module.exports = router;
