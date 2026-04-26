import { useEffect, useState } from 'react';
import { setAccessToken } from '@/shared/lib/axios';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '@/features/cart/stores/cart.store';

export function useInitAuth() {
  const [isReady, setIsReady] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const setCartCount = useCartStore((s) => s.setCartCount);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const refreshRes = await authService.refresh();

        // Bail immediately if this effect run was cleaned up (React StrictMode
        // runs effects twice; the first run gets cancelled before it resolves).
        if (cancelled) return;

        const token = refreshRes.data.accessToken;
        if (!token) {
          clear();
          setCartCount(0);
          setIsReady(true);
          return;
        }

        setAccessToken(token);

        const meRes = await authService.getMe();

        if (cancelled) return;

        const raw = meRes.data as unknown as Record<string, unknown>;
        const roleRaw = raw.role as { name?: string } | string | undefined;
        setUser({
          id: raw.id as number,
          email: raw.email as string,
          firstName: raw.firstName as string,
          lastName: raw.lastName as string,
          role: typeof roleRaw === 'string' ? roleRaw : (roleRaw?.name ?? 'customer'),
        });
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          clear();
          setCartCount(0);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [setUser, clear, setCartCount]);

  return isReady;
}
