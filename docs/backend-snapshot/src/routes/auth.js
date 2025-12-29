import { Router } from 'express';
import { currentUserController, loginController } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginController);
router.get('/me', currentUserController);

export default router;
