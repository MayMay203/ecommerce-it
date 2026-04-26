import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAccessToken } from '@/shared/lib/axios';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '@/features/cart/stores/cart.store';

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const clearCart = useCartStore((s) => s.setCartCount);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      setAccessToken(null);
      clear();
      clearCart(0);
      queryClient.clear();
    },
  });
}
