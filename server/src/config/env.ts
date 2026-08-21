import 'dotenv/config';

import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z
    .string()
    .trim()
    .refine((value) => /^mongodb(\+srv)?:\/\//.test(value), {
      error: 'MONGODB_URI must begin with mongodb:// or mongodb+srv://',
    }),
  CLIENT_ORIGIN: z
    .string()
    .trim()
    .pipe(
      z.url({
        error: 'CLIENT_ORIGIN must be a valid URL',
      })
    ),
  JWT_SECRET: z.string().min(32, {
    error: 'JWT_SECRET must contain at least 32 characters',
  }),
  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number({
      error: 'JWT_EXPIRES_IN_SECONDS must be a number',
    })
    .int()
    .min(300, {
      error: 'JWT_EXPIRES_IN_SECONDS must be at least 300',
    })
    .max(2_592_000, {
      error: 'JWT_EXPIRES_IN_SECONDS must not exceed 2592000',
    }),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

const environmentResult = environmentSchema.safeParse(process.env);

if (!environmentResult.success) {
  const issues = environmentResult.error.issues
    .map((issue) => {
      const field = issue.path.join('.') || 'environment';

      return `- ${field}: ${issue.message}`;
    })
    .join('\n');

  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = environmentResult.data;
