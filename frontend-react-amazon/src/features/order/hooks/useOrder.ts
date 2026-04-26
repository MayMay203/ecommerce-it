import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/order.service';

export function useOrder(orderId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderDetail(orderId),
    staleTime: 60_000,
    enabled,
  });
}
