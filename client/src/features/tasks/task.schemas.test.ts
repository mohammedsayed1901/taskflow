import { describe, expect, it } from 'vitest';

import { taskFormSchema } from './task.schemas';

const validTask = {
  title: 'Prepare technical review',
  description: 'Explain the TaskFlow architecture',
  status: 'todo',
  priority: 'high',
  dueDate: '2026-08-31',
} as const;

describe('taskFormSchema', () => {
  it('accepts and normalizes valid task input', () => {
    const result = taskFormSchema.parse({
      ...validTask,
      title: '  Prepare technical review  ',
      description: '  Explain the TaskFlow architecture  ',
    });

    expect(result.title).toBe('Prepare technical review');
    expect(result.description).toBe('Explain the TaskFlow architecture');
  });

  it('rejects an impossible calendar date', () => {
    const result = taskFormSchema.safeParse({
      ...validTask,
      dueDate: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty title', () => {
    const result = taskFormSchema.safeParse({
      ...validTask,
      title: '   ',
    });

    expect(result.success).toBe(false);
  });

  it('rejects unexpected properties', () => {
    const result = taskFormSchema.safeParse({
      ...validTask,
      owner: 'another-user',
    });

    expect(result.success).toBe(false);
  });
});
