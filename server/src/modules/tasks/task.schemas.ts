import { z } from 'zod';

import { TASK_PRIORITIES, TASK_STATUSES } from './task.constants.js';

const titleSchema = z
  .string({
    error: (issue) => (issue.input === undefined ? 'Title is required' : 'Title must be text'),
  })
  .trim()
  .min(1, { error: 'Title is required' })
  .max(100, { error: 'Title must be at most 100 characters' });

const descriptionSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Description is required' : 'Description must be text',
  })
  .trim()
  .min(1, { error: 'Description is required' })
  .max(1_000, {
    error: 'Description must be at most 1000 characters',
  });

const statusSchema = z.enum(TASK_STATUSES, {
  error: 'Status must be todo, in-progress, or done',
});

const prioritySchema = z.enum(TASK_PRIORITIES, {
  error: 'Priority must be low, medium, or high',
});

const dueDateSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Due date is required' : 'Due date must be text',
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
      error: 'Due date must be a valid calendar date',
    }
  )
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

export const createTaskBodySchema = z.strictObject({
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  priority: prioritySchema,
  dueDate: dueDateSchema,
});

export const updateTaskBodySchema = createTaskBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    error: 'Provide at least one task field to update',
  });

const pageQuerySchema = z
  .string({
    error: 'Page must be a positive integer',
  })
  .regex(/^[1-9]\d*$/, {
    error: 'Page must be a positive integer',
  })
  .transform(Number)
  .pipe(
    z.number().safe({
      error: 'Page is too large',
    })
  )
  .default(1);

const limitQuerySchema = z
  .string({
    error: 'Limit must be an integer from 1 to 100',
  })
  .regex(/^[1-9]\d*$/, {
    error: 'Limit must be an integer from 1 to 100',
  })
  .transform(Number)
  .pipe(
    z.number().safe().max(100, {
      error: 'Limit must not exceed 100',
    })
  )
  .default(12);

const taskSortSchema = z
  .enum(['dueDate', '-dueDate', 'createdAt', '-createdAt'], {
    error: 'Sort must be dueDate, -dueDate, createdAt, or -createdAt',
  })
  .default('dueDate');

export const listTasksQuerySchema = z.strictObject({
  search: z
    .string()
    .trim()
    .max(100, {
      error: 'Search must be at most 100 characters',
    })
    .optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  page: pageQuerySchema,
  limit: limitQuerySchema,
  sort: taskSortSchema,
});

export const taskIdParamsSchema = z.strictObject({
  taskId: z.string().regex(/^[a-f\d]{24}$/i, {
    error: 'Task ID must be a valid MongoDB ObjectId',
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskBodySchema>;

export type UpdateTaskInput = z.infer<typeof updateTaskBodySchema>;

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export type TaskIdParams = z.infer<typeof taskIdParamsSchema>;
