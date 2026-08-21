import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { validateBody } from '../../middleware/validate-body.js';
import { getCurrentUser, login, logout, register } from './auth.controller.js';
import { requireAuthentication } from './auth.middleware.js';
import { loginBodySchema, registerBodySchema } from './auth.schemas.js';

const authenticationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

export const authRouter = Router();

authRouter.post('/register', authenticationRateLimiter, validateBody(registerBodySchema), register);

authRouter.post('/login', authenticationRateLimiter, validateBody(loginBodySchema), login);

authRouter.post('/logout', logout);

authRouter.get('/me', requireAuthentication, getCurrentUser);
