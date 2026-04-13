# CLAUDE.md — Root (Global Rules)

## Project Overview

Full-stack e-commerce application with:
- **Backend:** NestJS v11 monolith, TypeORM, MySQL 8.x — located in `backend-nest-amazon/`
- **Frontend:** React 19 + Vite SPA, TanStack Query, Zustand — located in `frontend-react-amazon/`
- **API:** REST, base URL `/api/v1`, JWT Bearer auth
- **Architecture:** Feature-based modules on both ends — `auth`, `user-profile`, `product`, `cart`, `order`, `review`

---

## Repository Structure

```
ecommerce-it/
├── 01-shared-docs/
│   ├── DATABASE.md         # Schema, entity conventions, TypeORM notes
│   └── API_SPEC.md         # Endpoints, request/response format, error codes
├── backend-nest-amazon/
│   ├── docs/
│   │   ├── BE-ARCHITECTURE.md
│   │   └── BE-PROJECT-RULES.md
│   └── src/
├── frontend-react-amazon/
│   ├── docs/
│   │   ├── FE-ARCHITECTURE.md
│   │   └── FE-PROJECT-RULES.md
│   └── src/
```

---

## Naming Conventions (Shared)

| Target | Convention | Example |
|--------|-----------|---------|
| Feature folders | kebab-case | `user-profile`, `product` |
| Files (BE) | kebab-case | `create-user.dto.ts`, `user.entity.ts` |
| Files (FE) | kebab-case (non-components) / PascalCase (components) | `product.service.ts`, `ProductCard.tsx` |
| Database tables | snake_case, plural | `users`, `product_variants` |
| Database columns | snake_case | `created_at`, `user_id` |
| Foreign keys | `[singular_table]_id` | `user_id`, `product_id` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS`, `ORDER_STATUS` |

---

## Git Workflow

**Branch naming:** `[type]/[feature]-[short-description]`
```
feature/auth-jwt-refresh
fix/cart-guest-merge
refactor/order-checkout-flow
```

**Commit messages:** `[type]: [description]`
```
feat: add guest cart merge on login
fix: correct stock validation in checkout
refactor: extract payment logic to service
style: improve checkout form layout
```

**PR rules:**
- One feature or fix per PR
- All tests pass, no TypeScript errors
- Linked to issue/task; reviewed by at least 1 team member
- Include screenshots for UI changes
- Update `CONTEXT.md` in affected feature if logic changes

---

## Feature Boundaries

| Feature | Backend owns | Frontend owns |
|---------|-------------|--------------|
| `auth` | roles, users, JWT, refresh tokens | login/register UI, auth state (Zustand) |
| `user-profile` | addresses CRUD | address management pages |
| `product` | categories, products, variants, images | catalog, detail, variant selector |
| `cart` | carts, cart_items, guest merge | cart UI, optimistic updates |
| `order` | orders, order_items, checkout | order history, detail, cancel |
| `review` | reviews, verified-purchase check | reviews list, create/edit UI |

---

## Cross-Feature Communication Rules

**Backend:** Only via NestJS DI (module exports/imports) or EventEmitter for async side effects. Never import another feature's internal files directly.

**Frontend:** Only via `index.ts` barrel exports. Never import from a feature's internal file path.

---

## Do

- Read `01-shared-docs/DATABASE.md` before touching any entity or migration
- Read `01-shared-docs/API_SPEC.md` before adding or changing any endpoint or API call
- Read the feature's `CONTEXT.md` before editing a feature
- Use `product_variants` (not `products`) as the FK target in cart items and order items
- Snapshot address and product data into `orders` — never store FK references that can be mutated
- Store only `token_hash` in `refresh_tokens` — never plain tokens

## Don't

- Commit `.env` files — commit `.env.example` only
- Add endpoints not in `API_SPEC.md` without updating the spec first
- Add database columns/tables not in `DATABASE.md` without updating the schema doc
- Hardcode config values — use `ConfigService` (BE) or `config/constants.ts` (FE)
- Create cross-feature circular dependencies
