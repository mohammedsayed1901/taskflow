import type { TaskFilters, TaskListData, TaskStatus } from '../../types/api';

export interface MoveTaskVariables {
  taskId: string;
  status: TaskStatus;
}

export function moveTaskInCachedList(
  data: TaskListData,
  variables: MoveTaskVariables,
  filters: TaskFilters
): TaskListData {
  const taskExists = data.tasks.some((task) => task.id === variables.taskId);

  if (!taskExists) {
    return data;
  }

  const movesOutsideStatusFilter =
    filters.status !== undefined && filters.status !== variables.status;

  if (movesOutsideStatusFilter) {
    const total = Math.max(0, data.pagination.total - 1);

    return {
      ...data,
      tasks: data.tasks.filter((task) => task.id !== variables.taskId),
      pagination: {
        ...data.pagination,
        total,
        pages: Math.ceil(total / data.pagination.limit),
      },
    };
  }

  return {
    ...data,
    tasks: data.tasks.map((task) =>
      task.id === variables.taskId
        ? {
            ...task,
            status: variables.status,
          }
        : task
    ),
  };
}
