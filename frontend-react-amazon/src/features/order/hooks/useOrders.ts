import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/order.service';

export function useOrders(page: number = 1, limit: number = 10, status?: string) {
  return useQuery({
    queryKey: ['orders', page, limit, status],
    queryFn: () => orderService.getOrders(page, limit, status),
    staleTime: 60_000,
  });
}
