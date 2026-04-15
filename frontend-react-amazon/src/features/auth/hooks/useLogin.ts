import { useMutation } from '@tanstack/react-query';
import { setAccessToken } from '@/shared/lib/axios';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import type { LoginRequest } from '../types/auth.types';

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    },
  });
}
