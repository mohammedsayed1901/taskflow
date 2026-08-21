import type { ValidationDetail } from '../types/api';

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getValidationDetails(payload: unknown): ValidationDetail[] {
  if (!isRecord(payload) || !Array.isArray(payload.details)) {
    return [];
  }

  return payload.details.flatMap((detail) => {
    if (
      !isRecord(detail) ||
      typeof detail.field !== 'string' ||
      typeof detail.message !== 'string'
    ) {
      return [];
    }

    return [
      {
        field: detail.field,
        message: detail.message,
      },
    ];
  });
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details: readonly ValidationDetail[];

  public constructor(status: number, message: string, details: readonly ValidationDetail[] = []) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<TData>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TData> {
  const { body, headers: providedHeaders, ...requestOptions } = options;

  const headers = new Headers(providedHeaders);

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${path}`, {
    ...requestOptions,
    credentials: 'include',
    headers,
    ...(body === undefined
      ? {}
      : {
          body: JSON.stringify(body),
        }),
  });

  if (response.status === 204) {
    return undefined as TData;
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.message === 'string'
        ? payload.message
        : 'Something went wrong. Please try again.';

    throw new ApiError(response.status, message, getValidationDetails(payload));
  }

  if (!isRecord(payload) || payload.success !== true || !('data' in payload)) {
    throw new ApiError(response.status, 'The server returned an unexpected response.');
  }

  return payload.data as TData;
}
