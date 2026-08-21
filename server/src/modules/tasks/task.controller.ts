import type { Request, RequestHandler } from 'express';

import { AppError } from '../../errors/app-error.js';
import { getValidatedRequestPart } from '../../middleware/validate-request.js';
import type {
  CreateTaskInput,
  ListTasksQuery,
  TaskIdParams,
  UpdateTaskInput,
} from './task.schemas.js';
import { createTask, deleteTask, listTasks, updateTask } from './task.service.js';

function getAuthenticatedUserId(request: Request): string {
  if (!request.user) {
    throw new AppError(401, 'Authentication required');
  }

  return request.user.id;
}

export const listTasksHandler: RequestHandler = async (request, response) => {
  const ownerId = getAuthenticatedUserId(request);

  const query = getValidatedRequestPart<ListTasksQuery>(request, 'query');

  const result = await listTasks(ownerId, query);

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const createTaskHandler: RequestHandler = async (request, response) => {
  const ownerId = getAuthenticatedUserId(request);

  const input = getValidatedRequestPart<CreateTaskInput>(request, 'body');

  const task = await createTask(ownerId, input);

  response.status(201).json({
    success: true,
    data: {
      task,
    },
  });
};

export const updateTaskHandler: RequestHandler = async (request, response) => {
  const ownerId = getAuthenticatedUserId(request);

  const { taskId } = getValidatedRequestPart<TaskIdParams>(request, 'params');

  const input = getValidatedRequestPart<UpdateTaskInput>(request, 'body');

  const task = await updateTask(ownerId, taskId, input);

  response.status(200).json({
    success: true,
    data: {
      task,
    },
  });
};

export const deleteTaskHandler: RequestHandler = async (request, response) => {
  const ownerId = getAuthenticatedUserId(request);

  const { taskId } = getValidatedRequestPart<TaskIdParams>(request, 'params');

  await deleteTask(ownerId, taskId);

  response.status(204).send();
};
