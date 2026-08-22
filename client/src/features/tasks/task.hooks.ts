import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TaskFilters } from '../../types/api';
import { createTask, deleteTask, getTasks, updateTask } from './task.api';
import type { TaskFormInput } from './task.schemas';

interface UpdateTaskVariables {
  taskId: string;
  input: TaskFormInput;
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
