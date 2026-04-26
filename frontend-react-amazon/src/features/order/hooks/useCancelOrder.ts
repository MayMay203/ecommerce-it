import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/order.service';
import type { CancelOrderDto } from '../types/order.types';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, dto }: { orderId: number; dto?: CancelOrderDto }) =>
      orderService.cancelOrder(orderId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}
