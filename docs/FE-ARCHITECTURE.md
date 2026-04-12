# FE-ARCHITECTURE.md

## 1. Overview

**Stack justification:**

| Choice | Reason |
|--------|--------|
| React 19 + Vite | Fast HMR, native ESM, small bundle |
| TypeScript | Type safety across API boundary → UI |
| Zustand | Minimal boilerplate for global state (auth, cart count) |
| TanStack Query | Server-state caching, background refetch, loading/error built-in |
| React Router v6 | Nested routes, lazy loading, protected route patterns |
| Tailwind CSS | Utility-first, no CSS file sprawl, consistent design tokens |
| React Hook Form + Zod | Schema-driven validation, minimal re-renders |

---

## 2. Folder Structure

```
src/
├── main.tsx                        # Vite entry point
├── app/
│   ├── App.tsx                     # Root component, providers
│   ├── router.tsx                  # All route definitions
│   └── providers.tsx               # QueryClient, global wrappers
│
├── shared/
│   ├── components/                 # Reusable UI (Button, Modal, Table, Skeleton…)
│   ├── hooks/                      # Shared hooks (useDebounce, usePagination…)
│   ├── services/
│   │   └── api.ts                  # Axios base instance + interceptors
│   ├── stores/
│   │   └── auth.store.ts           # Global auth state (user, tokens)
│   ├── types/
│   │   ├── api.types.ts            # ApiResponse<T>, ApiError, PaginationMeta
│   │   └── common.types.ts
│   └── utils/
│       ├── format.ts               # Currency, date formatters
│       └── storage.ts              # localStorage helpers
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── orders/
│   └── reviews/
│
├── assets/                         # Static images, icons, fonts
└── styles/
    └── globals.css                 # Tailwind directives, CSS variables
```

---

## 3. Feature Anatomy

```
features/products/
├── components/
│   ├── ProductCard.tsx             # Single product tile
│   ├── ProductGrid.tsx             # Grid of ProductCards
│   └── VariantSelector.tsx        # Color/size picker
├── hooks/
│   ├── useProductList.ts           # TanStack Query — GET /products
│   └── useProductDetail.ts        # TanStack Query — GET /products/:id
├── services/
│   └── products.service.ts        # All Axios calls for this feature
├── types/
│   └── product.types.ts           # ProductSummary, ProductDetail, Variant
├── utils/
│   └── price.util.ts              # getSalePrice, formatDiscount
├── pages/
│   ├── ProductListPage.tsx        # Route: /
│   └── ProductDetailPage.tsx      # Route: /products/:id
├── index.ts                        # Barrel exports
└── context.md
```

---

## 4. Data Flow

```
User Action (click / submit)
    │
    ▼
Component  ──────────────────────────────────────┐
    │  calls hook                                 │
    ▼                                             │
Hook (TanStack Query / useMutation)              │ local state
    │  calls service                              │ (useState)
    ▼                                             │
Service (Axios)                                  │
    │                                             │
    ▼                                             │
API (NestJS)                                     │
    │                                             │
    ▼                                             │
TanStack Query Cache ────────────────────────────┘
    │
    ▼
Zustand Store (only for shared global state)
    │
    ▼
UI Re-render
```

---

## 5. Cross-feature Communication

| Method | Use case | Example |
|--------|----------|---------|
| Zustand global store | Auth user, cart item count | `useAuthStore()`, `useCartStore()` |
| URL / React Router | Navigate with data | `/orders/101`, `?category_id=3` |
| Props / barrel import | Parent composes features | `<CartSummary />` imported via `@/features/cart` |
| TanStack Query `invalidateQueries` | Trigger refetch across features | After checkout, invalidate `['orders']` |

**Forbidden:** direct internal path imports between features.

---

## 6. Routing Structure

```typescript
// app/router.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,          // nav, footer
    children: [
      { index: true, lazy: () => import('@/features/products/pages/ProductListPage') },
      { path: 'products/:id', lazy: () => import('@/features/products/pages/ProductDetailPage') },
      { path: 'login',  lazy: () => import('@/features/auth/pages/LoginPage') },
      { path: 'register', lazy: () => import('@/features/auth/pages/RegisterPage') },

      // Protected routes
      {
        element: <ProtectedRoute />,   // redirects to /login if no token
        children: [
          { path: 'cart',     lazy: () => import('@/features/cart/pages/CartPage') },
          { path: 'checkout', lazy: () => import('@/features/orders/pages/CheckoutPage') },
          { path: 'orders',   lazy: () => import('@/features/orders/pages/OrderListPage') },
          { path: 'orders/:id', lazy: () => import('@/features/orders/pages/OrderDetailPage') },
        ],
      },

      // Admin routes
      {
        path: 'admin',
        element: <AdminRoute />,       // requires role === 'admin'
        children: [
          { path: 'products', lazy: () => import('@/features/products/pages/AdminProductsPage') },
          { path: 'orders',   lazy: () => import('@/features/orders/pages/AdminOrdersPage') },
        ],
      },
    ],
  },
]);
```

- All routes use **`lazy()`** — code-split per page
- `ProtectedRoute` checks `useAuthStore().user` and redirects if null
- `AdminRoute` checks `user.role === 'admin'`

---

## 7. State Management Strategy

| State Type | Tool | Location | Example |
|------------|------|----------|---------|
| Server data | TanStack Query | Feature hook | Product list, order history |
| Auth | Zustand | `shared/stores/auth.store.ts` | `user`, `access_token` |
| Cart (global) | Zustand | `shared/stores/cart.store.ts` | Item count in navbar |
| Feature UI | Zustand slice or `useState` | Feature store / component | Checkout step |
| Local UI | `useState` | Component | Modal open, tab active |

**Rule:** if state is only needed by one component → `useState`. Cross-component in a feature → lift up or feature store. Cross-feature → Zustand or URL.

---

## 8. API Layer

```
shared/services/api.ts          ← Axios instance, base URL, token interceptor
        │
        ▼
features/[x]/services/*.ts      ← Feature-specific endpoint calls
        │
        ▼
features/[x]/hooks/*.ts         ← TanStack Query wrappers (useQuery / useMutation)
        │
        ▼
features/[x]/components/*.tsx   ← Consume hook, render data
```

**Axios interceptor (shared/services/api.ts):**
```typescript
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,               // unwrap envelope → return data directly
  err => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err.response?.data?.error);  // typed ApiError
  }
);
```

---

## 9. Shared vs Features

| | `shared/` | `features/` |
|---|-----------|-------------|
| **Components** | Button, Modal, Skeleton, Badge | ProductCard, OrderStatusBadge |
| **Hooks** | `useDebounce`, `usePagination` | `useProductList`, `useCheckout` |
| **Services** | `api.ts` (Axios base) | `products.service.ts` |
| **Stores** | `auth.store`, `cart.store` | Feature-local state only if needed |
| **Types** | `ApiResponse<T>`, `PaginationMeta` | `Product`, `Order`, `CartItem` |
