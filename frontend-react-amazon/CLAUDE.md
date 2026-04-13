# CLAUDE.md — Frontend (React)

> Also read: `../01-shared-docs/API_SPEC.md` before adding or changing any API call.

## Project Overview

- **Framework:** React 19 + Vite
- **Language:** TypeScript (strict mode)
- **State:** Zustand (global client) + TanStack Query (server state)
- **Styling:** Tailwind CSS (utility-first, no CSS files)
- **HTTP:** Axios with interceptors (auto token refresh on 401)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v7 — import from `'react-router'`, NOT `'react-router-dom'`

---

## Folder Structure

```
src/
├── main.tsx                    # Entry: render <App> in StrictMode
├── App.tsx                     # QueryClientProvider + RouterProvider
├── config/
│   ├── constants.ts            # API_BASE_URL, MAX_CART_ITEMS, etc.
│   └── env.ts                  # Typed import.meta.env wrapper
├── routes/
│   ├── index.tsx               # createBrowserRouter — all route definitions
│   ├── routes.ts               # ROUTES constants (as const)
│   ├── ProtectedRoute.tsx      # Checks auth → Outlet or Navigate to /login
│   └── AdminRoute.tsx          # Checks admin role → Outlet or Navigate
├── layouts/
│   ├── MainLayout.tsx          # Header + Footer + <Outlet />
│   ├── AuthLayout.tsx          # Centered card
│   └── AdminLayout.tsx         # Sidebar + Header + <Outlet />
├── shared/
│   ├── components/
│   │   ├── ui/                 # Button, Input, Modal, Dropdown, Badge
│   │   ├── feedback/           # Toast, Skeleton, Spinner, ErrorMessage
│   │   └── layout/             # Header, Footer, Sidebar
│   ├── hooks/                  # useDebounce, useLocalStorage, useMediaQuery
│   ├── lib/
│   │   ├── axios.ts            # Axios instance + interceptors
│   │   └── queryClient.ts      # TanStack Query client config
│   ├── stores/
│   │   └── ui.store.ts         # sidebarOpen, theme
│   ├── types/
│   │   ├── api.types.ts        # ApiResponse<T>, PaginatedResponse<T>
│   │   └── common.types.ts     # ID, Timestamp, etc.
│   └── utils/
│       ├── format.utils.ts     # formatPrice(), formatDate()
│       └── validation.utils.ts # Shared Zod schemas (email, phone)
├── features/
│   ├── auth/
│   ├── user-profile/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── order/
│   └── review/
└── assets/
```

Each feature folder:
```
features/[feature]/
├── components/         # Feature-specific UI components
├── hooks/              # TanStack Query hooks (useQuery / useMutation)
├── services/           # API calls via Axios
├── stores/             # Zustand store (only if feature needs global state)
├── types/              # TypeScript types
├── utils/              # Feature-specific utilities
├── pages/              # Page-level components (route targets)
├── index.ts            # Barrel exports — only public API
└── CONTEXT.md          # Feature doc: behavior, edge cases, API mapping
```

---

## Architecture Rules

### State Management — Which Tool for Which State

| State type | Tool | Example |
|-----------|------|---------|
| Server data | TanStack Query | products, orders, reviews |
| Auth state | Zustand (`auth.store`) | user, isAuthenticated |
| Cart count (badge) | Zustand (`cart.store`) | cartCount |
| Filters / pagination | `useSearchParams` (URL) | `?page=2&category=5` |
| Form data | React Hook Form | checkout form, review form |
| Local UI state | `useState` | modal open, tab selection |
| Global UI | Zustand (`ui.store`) | sidebarOpen, theme |

**Rules:**
- Server data → TanStack Query (NEVER Zustand)
- Auth/Cart → Zustand (consumed across multiple features)
- Filters/Pagination → URL params (shareable, bookmarkable)
- Forms → React Hook Form (local to form component)

### API Layer Flow

```
shared/lib/axios.ts          ← single Axios instance, interceptors
    ↓
features/[x]/services/       ← typed API calls, returns axios promise
    ↓
features/[x]/hooks/          ← useQuery / useMutation wrapping services
    ↓
features/[x]/components or pages ← consume hooks only, no direct service calls
```

### Cross-Feature Communication

```typescript
// ✅ Import from feature barrel
import { ProductCard } from '@/features/product';

// ❌ Import from internal file
import { ProductCard } from '@/features/product/components/ProductCard';
```

Feature dependency map:
- `auth` → standalone; provides `useAuthStore`
- `user-profile` → auth
- `product` → standalone
- `cart` → auth, product
- `checkout` → cart, user-profile
- `order` → auth
- `review` → auth, product, order

### Import Rules

- Features ✅ can import from `shared/`
- Features ✅ can import other features' public exports via `index.ts`
- Features ❌ cannot import from another feature's internal files
- `shared/` ❌ cannot import from `features/`

---

## Coding Conventions

### Naming

| Target | Convention | Example |
|--------|-----------|---------|
| Feature folders | kebab-case | `user-profile`, `checkout` |
| Components | PascalCase `.tsx` | `ProductCard.tsx` |
| Hooks | `use` prefix, camelCase | `useProducts.ts` |
| Services | camelCase + `.service` | `product.service.ts` |
| Stores | camelCase + `.store` | `cart.store.ts` |
| Types | camelCase + `.types` | `product.types.ts` |
| Utils | camelCase + `.utils` | `price.utils.ts` |
| Pages | PascalCase + `Page` | `ProductListPage.tsx` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS` |
| Route paths | via `ROUTES` constant | `ROUTES.PRODUCT_DETAIL` |

### Component Pattern

```tsx
// 1. Imports
import type { Product } from '../types/product.types';

// 2. Props interface
interface Props {
  product: Product;
  onAddToCart: (variantId: number) => void;
}

// 3. Named export (default only for pages/routes)
export function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      ...
    </div>
  );
}
```

- One component per file
- `interface Props {}` always required
- Max ~200 lines — split into sub-components if larger
- Use `React.memo()` only after measuring a real perf issue

### Service Pattern

```typescript
// features/product/services/product.service.ts
export const productService = {
  getAll: (params: ProductQuery) =>
    api.get<PaginatedResponse<Product>>('/products', { params }),
  getBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`),
};
```

### TanStack Query Hook Patterns

```typescript
// useQuery (GET)
export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  });
}

// useMutation (POST/PUT/DELETE)
export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: AddToCartDto) => cartService.addItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: () => toast.error('Failed to add item'),
  });
}
```

### Form Pattern (React Hook Form + Zod)

```typescript
const checkoutSchema = z.object({
  addressId: z.number().min(1, 'Select an address'),
  paymentMethod: z.enum(['cod', 'bank_transfer']),
});
type CheckoutFormData = z.infer<typeof checkoutSchema>;

function CheckoutForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });
}
```

### Loading & Error States

```tsx
function ProductListPage() {
  const { data, isLoading } = useProducts(params);
  if (isLoading) return <ProductListSkeleton />;   // Skeleton for initial load
  return <ProductList products={data} />;
}
// Route-level: errorElement: <RouteErrorPage />
```

### Authentication

```typescript
// Access token — memory only, NEVER localStorage
let accessToken: string | null = null;
export const setAccessToken = (token: string) => { accessToken = token; };

// Refresh token — httpOnly cookie (set by server)
// Auto-refresh via Axios interceptor in shared/lib/axios.ts:
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      await authService.refresh();
      return api.request(err.config);
    }
    return Promise.reject(err);
  }
);
```

### Routing

```typescript
// routes/routes.ts — always use ROUTES constants, never hardcode paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  PROFILE: '/profile',
  ADDRESSES: '/profile/addresses',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
} as const;

// Import from 'react-router' (NOT 'react-router-dom')
import { useNavigate, useParams, useSearchParams, Outlet } from 'react-router';

// Lazy load all page components
const ProductListPage = lazy(() => import('@/features/product/pages/ProductListPage'));
```

---

## API Conventions (from API_SPEC.md)

- Base URL: `/api/v1` — from `config/constants.ts`
- Auth header: `Authorization: Bearer <accessToken>`
- Request body fields: `camelCase`
- Pagination params: `?page=1&limit=10&sort=created_at&order=desc`
- Filters in URL: `?category_id=5&min_price=100&max_price=500`
- File upload: `multipart/form-data`, field `file`/`files`, max 5MB

Expected response shapes (defined in `shared/types/api.types.ts`):
```typescript
interface ApiResponse<T> { success: boolean; data: T; message?: string; }
interface PaginatedResponse<T> { success: boolean; data: T[]; meta: PaginationMeta; }
```

---

## Testing

- Test files co-located: `[Component].test.tsx`
- Tools: Vitest + React Testing Library
- Use `MemoryRouter` for route-dependent component tests

Coverage priority: Checkout flow (Critical) → Cart operations (High) → Auth flow (High) → Pure UI (Skip)

---

## Do

- Always use `ROUTES` constants for navigation — never hardcode paths
- Always use `useQuery`/`useMutation` hooks from TanStack Query for API calls
- Always define `interface Props {}` for every component
- Use `useSearchParams` for filter/pagination state — not Zustand
- Add `CONTEXT.md` to every feature documenting behavior and API mapping
- Export only public API from `index.ts` barrel in each feature
- Use `shared/components/feedback/` (Skeleton, Spinner) for loading states
- Lazy-load all page components with `React.lazy()`

## Don't

- Call APIs directly in components — always go through service → hook
- Use `useEffect` for data fetching — use `useQuery` instead
- Store server data in Zustand — use TanStack Query cache
- Import from `'react-router-dom'` — use `'react-router'` (v7)
- Store access tokens in `localStorage` or `sessionStorage` — memory only
- Use inline styles — use Tailwind utility classes
- Use `any` type — enable strict mode and type everything
- Use array index as React list key — always use `item.id`
- Hardcode API URLs or route paths anywhere in the codebase
