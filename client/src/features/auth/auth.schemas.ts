import { z } from 'zod';

function requiredString(fieldName: string) {
  return z.string({
    error: (issue) =>
      issue.input === undefined ? `${fieldName} is required` : `${fieldName} must be text`,
  });
}

function fitsBcryptLimit(password: string): boolean {
  return new TextEncoder().encode(password).length <= 72;
}

const emailSchema = requiredString('Email')
  .trim()
  .toLowerCase()
  .min(1, {
    error: 'Email is required',
  })
  .max(254, {
    error: 'Email must not exceed 254 characters',
  })
  .pipe(
    z.email({
      error: 'Enter a valid email address',
    })
  );

const loginPasswordSchema = requiredString('Password')
  .min(1, {
    error: 'Password is required',
  })
  .max(72, {
    error: 'Password must not exceed 72 characters',
  })
  .refine(fitsBcryptLimit, {
    error: 'Password must not exceed 72 UTF-8 bytes',
  });

const registrationPasswordSchema = requiredString('Password')
  .min(8, {
    error: 'Password must contain at least 8 characters',
  })
  .max(72, {
    error: 'Password must not exceed 72 characters',
  })
  .regex(/[A-Z]/, {
    error: 'Password must include an uppercase letter',
  })
  .regex(/[a-z]/, {
    error: 'Password must include a lowercase letter',
  })
  .regex(/[0-9]/, {
    error: 'Password must include a number',
  })
  .refine(fitsBcryptLimit, {
    error: 'Password must not exceed 72 UTF-8 bytes',
  });

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const registerSchema = z.strictObject({
  name: requiredString('Name')
    .trim()
    .min(2, {
      error: 'Name must contain at least 2 characters',
    })
    .max(60, {
      error: 'Name must not exceed 60 characters',
    }),
  email: emailSchema,
  password: registrationPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
