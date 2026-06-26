import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerBodySchema, loginBodySchema } from '../utils/validation.schemas';

const router = Router();

/**
 * POST /api/auth/register - Register a new user
 * POST /api/auth/login    - Authenticate user & get token
 */
router.post('/register', validateRequest({ body: registerBodySchema }), register);
router.post('/login', validateRequest({ body: loginBodySchema }), login);

export default router;
