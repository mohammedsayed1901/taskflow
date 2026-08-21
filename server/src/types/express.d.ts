import type { PublicUser } from '../modules/auth/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;

      validated?: Partial<Record<'body' | 'params' | 'query', unknown>>;
    }
  }
}

export {};
