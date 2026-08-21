export interface ValidationDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;
  public readonly details: readonly ValidationDetail[] | undefined;

  public constructor(statusCode: number, message: string, details?: readonly ValidationDetail[]) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;

    Error.captureStackTrace(this, AppError);
  }
}
