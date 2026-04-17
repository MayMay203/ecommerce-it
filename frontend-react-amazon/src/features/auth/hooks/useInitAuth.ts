import { useEffect, useState } from 'react';
import { setAccessToken } from '@/shared/lib/axios';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export function useInitAuth() {
  const [isReady, setIsReady] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Try to get a fresh access token via the httpOnly refresh cookie
        const refreshRes = await authService.refresh();
        const token = refreshRes.data.accessToken;

        if (!token || cancelled) {
          clear();
          setIsReady(true);
          return;
        }

        setAccessToken(token);

        // Fetch the current user with the fresh token
        const meRes = await authService.getMe();
        if (!cancelled) {
          const raw = meRes.data as unknown as Record<string, unknown>;
          const roleRaw = raw.role as { name?: string } | string | undefined;
          setUser({
            id: raw.id as number,
            email: raw.email as string,
            firstName: raw.firstName as string,
            lastName: raw.lastName as string,
            role: typeof roleRaw === 'string' ? roleRaw : (roleRaw?.name ?? 'customer'),
          });
        }
      } catch {
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [setUser, clear]);

  return isReady;
}
