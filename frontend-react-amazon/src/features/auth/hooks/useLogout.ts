import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAccessToken } from '@/shared/lib/axios';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      setAccessToken(null);
      clear();
      queryClient.clear();
    },
  });
}
