# Auth Feature — CONTEXT.md

## Entities
- `roles` — role lookup (customer, admin)
- `users` — application users with `role_id` FK
- `refresh_tokens` — hashed refresh tokens per device/session

## Business Rules
- Passwords are hashed with bcrypt (SALT_ROUNDS = 10) — never stored plain
- Refresh tokens stored as `token_hash` — never plain token
- Access token TTL: 15m | Refresh token TTL: 7d (httpOnly cookie)
- Login creates a new `refresh_tokens` record
- Logout sets `is_revoked = true` on current token
- Logout all devices sets `is_revoked = true` for all user tokens
- Rate limit: 5 req/min on `/auth/login` and `/auth/register`

## Edge Cases
- Duplicate email on register → 409 AUTH_005
- Invalid credentials → 401 AUTH_001
- Expired/invalid token → 401 AUTH_002 / AUTH_003
- Insufficient role → 403 AUTH_004

## Exports
- `AuthModule` exports `JwtModule` and `UserRepository` for other features
