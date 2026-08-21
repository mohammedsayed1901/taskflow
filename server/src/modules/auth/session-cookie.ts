import type { CookieOptions, Response } from 'express';

import { env } from '../../config/env.js';

export const SESSION_COOKIE_NAME = 'taskflow_session';

const commonCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

const sessionCookieOptions: CookieOptions = {
  ...commonCookieOptions,
  maxAge: env.JWT_EXPIRES_IN_SECONDS * 1_000,
};

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE_NAME, commonCookieOptions);
}
