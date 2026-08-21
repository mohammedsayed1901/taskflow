import type { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { AppError } from '../../errors/app-error.js';
import { UserModel } from '../../models/user.model.js';
import { clearSessionCookie, SESSION_COOKIE_NAME } from './session-cookie.js';
import { verifySessionToken } from './session-token.service.js';
import { toPublicUser } from './auth.types.js';

export const requireAuthentication: RequestHandler = async (request, response, next) => {
  const token: unknown = request.cookies?.[SESSION_COOKIE_NAME];

  if (typeof token !== 'string' || token.length === 0) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  let userId: string;

  try {
    userId = verifySessionToken(token);
  } catch (error: unknown) {
    clearSessionCookie(response);
    next(error);
    return;
  }

  if (!mongoose.isObjectIdOrHexString(userId)) {
    clearSessionCookie(response);
    next(new AppError(401, 'Authentication required'));
    return;
  }

  const user = await UserModel.findById(userId).select('name email').lean();

  if (!user) {
    clearSessionCookie(response);
    next(new AppError(401, 'Authentication required'));
    return;
  }

  request.user = toPublicUser(user);
  next();
};
