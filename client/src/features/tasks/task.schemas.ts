import { z } from 'zod';

import { TASK_PRIORITIES, TASK_STATUSES } from '../../types/api';

const titleSchema = z
  .string({
    error: 'Title is required',
  })
  .trim()
  .min(1, {
    error: 'Title is required',
  })
  .max(100, {
    error: 'Title must be at most 100 characters',
  });

const descriptionSchema = z
  .string({
    error: 'Description is required',
  })
  .trim()
  .min(1, {
    error: 'Description is required',
  })
  .max(1_000, {
    error: 'Description must be at most 1000 characters',
  });

const dueDateSchema = z
  .string({
    error: 'Due date is required',
  })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: 'Due date must use YYYY-MM-DD',
  })
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00.000Z`);

      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    },
    {
      error: 'Due date must be a valid date',
    }
  );

export const taskFormSchema = z.strictObject({
  title: titleSchema,
  description: descriptionSchema,
  status: z.enum(TASK_STATUSES, {
    error: 'Select a valid status',
  }),
  priority: z.enum(TASK_PRIORITIES, {
    error: 'Select a valid priority',
  }),
  dueDate: dueDateSchema,
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;
