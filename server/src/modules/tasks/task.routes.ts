import { Router } from 'express';

import { validateBody, validateParams, validateQuery } from '../../middleware/validate-request.js';
import { requireAuthentication } from '../auth/auth.middleware.js';
import {
  createTaskHandler,
  deleteTaskHandler,
  listTasksHandler,
  updateTaskHandler,
} from './task.controller.js';
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskBodySchema,
} from './task.schemas.js';

export const taskRouter = Router();

taskRouter.use(requireAuthentication);

taskRouter.get('/', validateQuery(listTasksQuerySchema), listTasksHandler);

taskRouter.post('/', validateBody(createTaskBodySchema), createTaskHandler);

taskRouter.patch(
  '/:taskId',
  validateParams(taskIdParamsSchema),
  validateBody(updateTaskBodySchema),
  updateTaskHandler
);

taskRouter.delete('/:taskId', validateParams(taskIdParamsSchema), deleteTaskHandler);
