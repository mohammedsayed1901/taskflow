import type { RequestHandler } from 'express';

import { AppError } from '../../errors/app-error.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import { loginUser, registerUser } from './auth.service.js';
import { clearSessionCookie, setSessionCookie } from './session-cookie.js';
import type { PublicUser } from './auth.types.js';

interface AuthenticationResponse {
  success: true;
  data: {
    user: PublicUser;
  };
}

type AuthenticationHandler<TBody = unknown> = RequestHandler<
  Record<string, never>,
  AuthenticationResponse,
  TBody
>;

export const register: AuthenticationHandler<RegisterInput> = async (request, response) => {
  const result = await registerUser(request.body);

  setSessionCookie(response, result.token);

  response.status(201).json({
    success: true,
    data: {
      user: result.user,
    },
  });
};

export const login: AuthenticationHandler<LoginInput> = async (request, response) => {
  const result = await loginUser(request.body);

  setSessionCookie(response, result.token);

  response.status(200).json({
    success: true,
    data: {
      user: result.user,
    },
  });
};

export const logout: RequestHandler = (_request, response) => {
  clearSessionCookie(response);
  response.status(204).send();
};

export const getCurrentUser: AuthenticationHandler = (request, response, next) => {
  if (!request.user) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  response.status(200).json({
    success: true,
    data: {
      user: request.user,
    },
  });
};
