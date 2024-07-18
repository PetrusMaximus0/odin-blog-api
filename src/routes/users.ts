import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();
//
router.post('/login', userController.login_POST);

// Authenticate the user token,
router.get('/validateToken', userController.validateToken_GET);

//
router.post('/new', userController.newuser_POST);

export default router;
