import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TaskFilters, TaskListData } from '../../types/api';
import { createTask, deleteTask, getTasks, updateTask } from './task.api';
import type { TaskUpdateInput } from './task.schemas';
import { moveTaskInCachedList, type MoveTaskVariables } from './task-cache';

interface UpdateTaskVariables {
  taskId: string;
  input: TaskUpdateInput;
}

export const taskKeys = {
  all: ['tasks'] as const,

  list(filters: TaskFilters) {
    return [...this.all, 'list', filters] as const;
  },
};

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => getTasks(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    onSuccess() {
      return queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn({ taskId, input }: UpdateTaskVariables) {
      return updateTask(taskId, input);
    },

    onSuccess() {
      return queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    },
  });
}

export function useMoveTaskMutation(filters: TaskFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn({ taskId, status }: MoveTaskVariables) {
      return updateTask(taskId, { status });
    },

    async onMutate(variables) {
      const queryKey = taskKeys.list(filters);

      await queryClient.cancelQueries({
        queryKey,
      });

      const previousData = queryClient.getQueryData<TaskListData>(queryKey);

      if (previousData) {
        queryClient.setQueryData<TaskListData>(
          queryKey,
          moveTaskInCachedList(previousData, variables, filters)
        );
      }

      return {
        queryKey,
        previousData,
      };
    },

    onError(_error, _variables, context) {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },

    onSettled() {
      return queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,

    onSuccess() {
      return queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    },
  });
}
