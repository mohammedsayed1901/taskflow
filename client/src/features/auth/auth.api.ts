import type { LoginInput, RegisterInput } from './auth.schemas';
import { ApiError, apiRequest } from '../../lib/api-client';
import type { User } from '../../types/api';

interface AuthenticationData {
  user: User;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await apiRequest<AuthenticationData>('/auth/me');

    return data.user;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<User> {
  const data = await apiRequest<AuthenticationData>('/auth/login', {
    method: 'POST',
    body: input,
  });

  return data.user;
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const data = await apiRequest<AuthenticationData>('/auth/register', {
    method: 'POST',
    body: input,
  });

  return data.user;
}

export async function logoutUser(): Promise<void> {
  await apiRequest<void>('/auth/logout', {
    method: 'POST',
  });
}
