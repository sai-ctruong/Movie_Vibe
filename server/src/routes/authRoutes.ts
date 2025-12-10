import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/profile', authenticate, getProfile);

export default router;
