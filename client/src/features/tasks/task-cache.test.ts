import { describe, expect, it } from 'vitest';

import type { TaskFilters, TaskListData } from '../../types/api';
import { moveTaskInCachedList } from './task-cache';

const filters: TaskFilters = {
  page: 1,
  limit: 12,
  sort: 'dueDate',
};

function createTaskList(): TaskListData {
  return {
    tasks: [
      {
        id: 'task-1',
        title: 'Prepare review',
        description: 'Demonstrate TaskFlow',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-08-31T00:00:00.000Z',
        // dueDate: '2026-08-31',
        createdAt: '2026-08-22T10:00:00.000Z',
        updatedAt: '2026-08-22T10:00:00.000Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 12,
      total: 1,
      pages: 1,
    },
  };
}

describe('moveTaskInCachedList', () => {
  it('moves a task without mutating the previous cache', () => {
    const previous = createTaskList();

    const result = moveTaskInCachedList(
      previous,
      {
        taskId: 'task-1',
        status: 'in-progress',
      },
      filters
    );

    expect(result.tasks[0]?.status).toBe('in-progress');
    expect(previous.tasks[0]?.status).toBe('todo');
    expect(result).not.toBe(previous);
  });

  it('removes a task moved outside the active status filter', () => {
    const result = moveTaskInCachedList(
      createTaskList(),
      {
        taskId: 'task-1',
        status: 'done',
      },
      {
        ...filters,
        status: 'todo',
      }
    );

    expect(result.tasks).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.pages).toBe(0);
  });

  it('returns the existing cache when the task is absent', () => {
    const previous = createTaskList();

    const result = moveTaskInCachedList(
      previous,
      {
        taskId: 'missing-task',
        status: 'done',
      },
      filters
    );

    expect(result).toBe(previous);
  });
});
