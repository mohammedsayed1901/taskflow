import { Types } from 'mongoose';

import { AppError } from '../../errors/app-error.js';
import { TaskModel, type Task } from '../../models/task.model.js';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './task.schemas.js';
import { toPublicTask, type PublicTask, type TaskListResult } from './task.types.js';

interface TaskListFilter {
  owner: Types.ObjectId;
  title?: {
    $regex: string;
    $options: 'i';
  };
  status?: Task['status'];
  priority?: Task['priority'];
}

interface OwnedTaskFilter {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
}

const TASK_SORT_OPTIONS: Record<ListTasksQuery['sort'], Record<string, 1 | -1>> = {
  dueDate: {
    dueDate: 1,
    _id: 1,
  },
  '-dueDate': {
    dueDate: -1,
    _id: 1,
  },
  createdAt: {
    createdAt: 1,
    _id: 1,
  },
  '-createdAt': {
    createdAt: -1,
    _id: 1,
  },
};

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ownerObjectId(ownerId: string): Types.ObjectId {
  return new Types.ObjectId(ownerId);
}

function ownedTaskFilter(ownerId: string, taskId: string): OwnedTaskFilter {
  return {
    _id: new Types.ObjectId(taskId),
    owner: ownerObjectId(ownerId),
  };
}

export async function createTask(ownerId: string, input: CreateTaskInput): Promise<PublicTask> {
  const task = await TaskModel.create({
    owner: ownerObjectId(ownerId),
    ...input,
  });

  return toPublicTask(task);
}

export async function listTasks(ownerId: string, query: ListTasksQuery): Promise<TaskListResult> {
  const filter: TaskListFilter = {
    owner: ownerObjectId(ownerId),
  };

  if (query.search) {
    filter.title = {
      $regex: escapeRegularExpression(query.search),
      $options: 'i',
    };
  }

  if (query.status !== undefined) {
    filter.status = query.status;
  }

  if (query.priority !== undefined) {
    filter.priority = query.priority;
  }

  const skip = (query.page - 1) * query.limit;

  const [tasks, total] = await Promise.all([
    TaskModel.find(filter).sort(TASK_SORT_OPTIONS[query.sort]).skip(skip).limit(query.limit).exec(),
    TaskModel.countDocuments(filter).exec(),
  ]);

  return {
    tasks: tasks.map(toPublicTask),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function updateTask(
  ownerId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<PublicTask> {
  const task = await TaskModel.findOneAndUpdate(
    ownedTaskFilter(ownerId, taskId),
    {
      $set: input,
    },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  ).exec();

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  return toPublicTask(task);
}

export async function deleteTask(ownerId: string, taskId: string): Promise<void> {
  const task = await TaskModel.findOneAndDelete(ownedTaskFilter(ownerId, taskId)).exec();

  if (!task) {
    throw new AppError(404, 'Task not found');
  }
}
