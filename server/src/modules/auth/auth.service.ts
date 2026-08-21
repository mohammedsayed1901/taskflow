import { AppError } from '../../errors/app-error.js';
import { UserModel } from '../../models/user.model.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import { comparePassword, hashPassword } from './password.service.js';
import { createSessionToken } from './session-token.service.js';
import { type PublicUser, type UserIdentity, toPublicUser } from './auth.types.js';

export interface AuthenticationResult {
  user: PublicUser;
  token: string;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

function createAuthenticationResult(user: UserIdentity): AuthenticationResult {
  const publicUser = toPublicUser(user);

  return {
    user: publicUser,
    token: createSessionToken(publicUser.id),
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthenticationResult> {
  const existingUser = await UserModel.exists({
    email: input.email,
  });

  if (existingUser) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return createAuthenticationResult(user);
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, 'An account with this email already exists');
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<AuthenticationResult> {
  const user = await UserModel.findOne({
    email: input.email,
  }).select('+passwordHash');

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  return createAuthenticationResult(user);
}
