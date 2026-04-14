# Auth Feature — CONTEXT.md

## Responsibility
Login, register, logout, auth state (user + access token)

## State
- `auth.store.ts` (Zustand) — `user`, `isAuthenticated`, `setUser`, `clear`
- Access token in memory only (`shared/lib/axios.ts`) — NEVER localStorage
- Refresh token in httpOnly cookie (set by server)

## API Mapping
| Action | Endpoint |
|--------|----------|
| Register | `POST /auth/register` |
| Login | `POST /auth/login` → returns `accessToken` + sets cookie |
| Refresh | `POST /auth/refresh` → called by axios interceptor on 401 |
| Logout | `POST /auth/logout` |
| Get profile | `GET /auth/me` |
| Update profile | `PATCH /auth/me` |
| Change password | `PATCH /auth/change-password` |

## Business Rules
- Access token TTL: 15m — stored in memory via `setAccessToken()`
- Refresh token TTL: 7d — httpOnly cookie, auto-sent on `/auth/refresh`
- On login: store `accessToken` in memory, store `user` in Zustand
- On logout: call API, clear Zustand store, clear `accessToken`
- Auto-refresh handled by axios response interceptor (`shared/lib/axios.ts`)

## Exports (via index.ts)
- `useAuthStore` — Zustand store
- `LoginPage`, `RegisterPage` — page components
- Types: `User`, `LoginRequest`, `AuthResponse`
