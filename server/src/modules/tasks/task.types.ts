import type { Types } from 'mongoose';

import type { TaskPriority, TaskStatus } from './task.constants.js';

export interface PublicTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  _id: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskListResult {
  tasks: PublicTask[];
  pagination: TaskPagination;
}

export function toPublicTask(task: TaskRecord): PublicTask {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
