import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UpdateUserRequest } from '../types/user.types';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
