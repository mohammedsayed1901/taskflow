import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError } from './api-client';

export function applyApiFormErrors<TFieldValues extends FieldValues>(
  error: unknown,
  fields: readonly Path<TFieldValues>[],
  setError: UseFormSetError<TFieldValues>
): string | null {
  if (!(error instanceof ApiError)) {
    return 'Unable to reach the server. Please try again.';
  }

  let fieldErrorApplied = false;

  for (const detail of error.details) {
    const field = fields.find((candidate) => candidate === detail.field);

    if (!field) {
      continue;
    }

    setError(field, {
      type: 'server',
      message: detail.message,
    });

    fieldErrorApplied = true;
  }

  return fieldErrorApplied ? null : error.message;
}
