import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { User } from '../../types/api';
import { getCurrentUser, loginUser, logoutUser, registerUser } from './auth.api';

export const authKeys = {
  all: ['auth'] as const,
  currentUser: ['auth', 'current-user'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,

    onSuccess(user) {
      queryClient.setQueryData<User | null>(authKeys.currentUser, user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,

    onSuccess(user) {
      queryClient.setQueryData<User | null>(authKeys.currentUser, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,

    onSuccess() {
      queryClient.setQueryData<User | null>(authKeys.currentUser, null);

      queryClient.removeQueries({
        queryKey: ['tasks'],
      });
    },
  });
}
