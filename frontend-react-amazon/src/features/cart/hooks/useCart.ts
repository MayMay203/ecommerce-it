import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../stores/cart.store';

export function useCart() {
  const setCartCount = useCartStore((s) => s.setCartCount);

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    staleTime: 30_000,
  });

  useEffect(() => {
    const total = query.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    setCartCount(total);
  }, [query.data, setCartCount]);

  return query;
}
