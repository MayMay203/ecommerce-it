import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth';
import { wishlistService } from '../services/wishlist.service';
import { useWishlistStore } from '../stores/wishlist.store';

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setWishlistCount = useWishlistStore((s) => s.setWishlistCount);

  const query = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }
    setWishlistCount(query.data?.items.length ?? 0);
  }, [isAuthenticated, query.data, setWishlistCount]);

  return query;
}
