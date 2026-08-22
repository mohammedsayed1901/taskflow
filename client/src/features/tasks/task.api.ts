import { apiRequest } from '../../lib/api-client';
import type { Task, TaskFilters, TaskListData } from '../../types/api';
import type { TaskFormInput, TaskUpdateInput } from './task.schemas';

interface TaskData {
  task: Task;
}

export async function getTasks(filters: TaskFilters): Promise<TaskListData> {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set('search', filters.search);
  }

  if (filters.status) {
    searchParams.set('status', filters.status);
  }

  if (filters.priority) {
    searchParams.set('priority', filters.priority);
  }

  searchParams.set('page', String(filters.page));
  searchParams.set('limit', String(filters.limit));
  searchParams.set('sort', filters.sort);

  return apiRequest<TaskListData>(`/tasks?${searchParams.toString()}`);
}

export async function createTask(input: TaskFormInput): Promise<Task> {
  const data = await apiRequest<TaskData>('/tasks', {
    method: 'POST',
    body: input,
  });

  return data.task;
}

export async function updateTask(taskId: string, input: TaskUpdateInput): Promise<Task> {
  const data = await apiRequest<TaskData>(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: input,
  });

  return data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiRequest<void>(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}
