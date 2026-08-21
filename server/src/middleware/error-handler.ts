import type { ErrorRequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';

type MalformedJsonError = SyntaxError & {
  status: number;
  type: string;
};

function isMalformedJsonError(error: unknown): error is MalformedJsonError {
  return (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400 &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  );
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  void _next;

  if (isMalformedJsonError(error)) {
    response.status(400).json({
      success: false,
      message: 'Request body contains invalid JSON',
    });

    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  console.error('Unexpected server error:', error);

  response.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
