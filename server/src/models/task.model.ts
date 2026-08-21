import { model, Schema, type Types } from 'mongoose';

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '../modules/tasks/task.constants.js';

export interface Task {
  owner: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<Task>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1_000,
    },

    status: {
      type: String,
      required: true,
      enum: TASK_STATUSES,
    },

    priority: {
      type: String,
      required: true,
      enum: TASK_PRIORITIES,
    },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

taskSchema.index(
  {
    owner: 1,
    dueDate: 1,
    _id: 1,
  },
  {
    name: 'tasks_owner_due_date_id',
  }
);

taskSchema.index(
  {
    owner: 1,
    status: 1,
    priority: 1,
    dueDate: 1,
  },
  {
    name: 'tasks_owner_status_priority_due_date',
  }
);

export const TaskModel = model<Task>('Task', taskSchema);
