import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

import { AppError, type ValidationDetail } from '../errors/app-error.js';

export function validateBody(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const details: ValidationDetail[] = result.error.issues.flatMap((issue) => {
        if (issue.code === 'unrecognized_keys') {
          return issue.keys.map((key) => ({
            field: key,
            message: 'Field is not allowed',
          }));
        }

        return [
          {
            field: issue.path.map(String).join('.') || 'body',
            message: issue.message,
          },
        ];
      });

      next(new AppError(400, 'Please correct the highlighted fields', details));

      return;
    }

    request.body = result.data;
    next();
  };
}
