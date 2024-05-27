const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//
router.get('/', userController.login_index);
//
router.get('/login', userController.login_GET);
//
router.post('/login', userController.login_POST);
// Authenticate the user token,
router.get('/validateToken', userController.validateToken_GET);
//
router.post('/new', userController.newuser_POST);

module.exports = router;
