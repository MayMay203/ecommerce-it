import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/order.service';
import type { CreateOrderDto } from '../types/order.types';

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateOrderDto) => orderService.createOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
