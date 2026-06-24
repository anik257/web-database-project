import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/register - Register a new user
 * POST /api/auth/login    - Authenticate user & get token
 */
router.post('/register', register);
router.post('/login', login);

export default router;
