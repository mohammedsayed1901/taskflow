import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { AppError } from '../../errors/app-error.js';

const TOKEN_ALGORITHM = 'HS256';
const TOKEN_ISSUER = 'taskflow-api';
const TOKEN_AUDIENCE = 'taskflow-client';

interface SessionPayload extends jwt.JwtPayload {
  type: 'session';
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    type: 'session',
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: TOKEN_ALGORITHM,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
  });
}

export function verifySessionToken(token: string): string {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: [TOKEN_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    if (
      typeof payload === 'string' ||
      payload.type !== 'session' ||
      typeof payload.sub !== 'string'
    ) {
      throw new Error('Invalid session payload');
    }

    return payload.sub;
  } catch {
    throw new AppError(401, 'Authentication required');
  }
}
