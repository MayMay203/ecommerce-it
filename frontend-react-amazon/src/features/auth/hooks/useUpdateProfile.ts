import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import type { UpdateMeRequest } from '../types/auth.types';

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => authService.updateMe(data),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data);
      }
    },
  });
}
