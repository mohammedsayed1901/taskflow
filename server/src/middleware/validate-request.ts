import type { Request, RequestHandler } from 'express';
import type { ZodError, ZodType } from 'zod';

import { AppError, type ValidationDetail } from '../errors/app-error.js';

export type RequestValidationSource = 'body' | 'params' | 'query';

function createValidationDetails(
  error: ZodError,
  fallbackField: RequestValidationSource
): ValidationDetail[] {
  return error.issues.flatMap((issue) => {
    if (issue.code === 'unrecognized_keys') {
      const parentPath = issue.path.map(String);

      return issue.keys.map((key) => ({
        field: [...parentPath, key].join('.'),
        message: 'Field is not allowed',
      }));
    }

    return [
      {
        field: issue.path.map(String).join('.') || fallbackField,
        message: issue.message,
      },
    ];
  });
}

function validateRequestPart(source: RequestValidationSource, schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request[source]);

    if (!result.success) {
      const details = createValidationDetails(result.error, source);

      next(new AppError(400, 'Please correct the highlighted fields', details));

      return;
    }

    request.validated = {
      ...request.validated,
      [source]: result.data,
    };

    // Existing authentication controllers read request.body.
    // req.query is intentionally not reassigned because it is
    // read-only in Express 5.
    if (source === 'body') {
      request.body = result.data;
    }

    next();
  };
}

export function validateBody(schema: ZodType): RequestHandler {
  return validateRequestPart('body', schema);
}

export function validateParams(schema: ZodType): RequestHandler {
  return validateRequestPart('params', schema);
}

export function validateQuery(schema: ZodType): RequestHandler {
  return validateRequestPart('query', schema);
}

export function getValidatedRequestPart<T>(request: Request, source: RequestValidationSource): T {
  const data = request.validated?.[source];

  if (data === undefined) {
    throw new Error(`Validated request ${source} is unavailable`);
  }

  return data as T;
}
