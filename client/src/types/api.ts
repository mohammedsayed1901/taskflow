export const TASK_STATUSES = ['todo', 'in-progress', 'done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskListData {
  tasks: Task[];
  pagination: Pagination;
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export const TASK_SORTS = ['dueDate', '-dueDate', 'createdAt', '-createdAt'] as const;

export type TaskSort = (typeof TASK_SORTS)[number];

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page: number;
  limit: number;
  sort: TaskSort;
}
