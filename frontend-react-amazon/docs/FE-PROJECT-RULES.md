# FE-PROJECT-RULES.md — Frontend (Feature-based)

## Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript (strict mode)
- **State:** Zustand (global client) + TanStack Query (server state)
- **Styling:** Tailwind CSS
- **HTTP:** Axios
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v7

---

## 1. Feature Structure

```
src/
├── features/
│   ├── auth/               # login, register, JWT handling
│   ├── user-profile/       # addresses management
│   ├── product/            # catalog, categories, product detail
│   ├── cart/               # cart management, guest cart
│   ├── checkout/           # checkout flow, order creation
│   ├── order/              # order history, order detail
│   └── review/             # product reviews
├── shared/
│   ├── components/         # Button, Input, Modal, Skeleton, etc.
│   ├── hooks/              # useDebounce, useLocalStorage, etc.
│   ├── layouts/            # MainLayout, AdminLayout
│   ├── lib/                # axios instance, utils
│   └── types/              # common types
├── config/
│   └── constants.ts        # API_BASE_URL, MAX_CART_ITEMS, etc.
├── routes/
│   ├── index.tsx           # createBrowserRouter config
│   ├── routes.ts           # ROUTES constants (type-safe)
│   ├── ProtectedRoute.tsx  # Auth guard
│   └── AdminRoute.tsx      # Admin role guard
├── App.tsx
└── main.tsx
```

Each feature folder:
```
features/[feature-name]/
├── components/             # ProductCard.tsx, ProductList.tsx
├── hooks/                  # useProducts.ts (TanStack Query)
├── services/               # product.service.ts (API calls)
├── stores/                 # product.store.ts (Zustand, if needed)
├── types/                  # product.types.ts
├── utils/                  # product.utils.ts
├── pages/                  # ProductListPage.tsx, ProductDetailPage.tsx
├── index.ts                # barrel exports
└── CONTEXT.md
```

---

## 2. Naming Conventions

| Target | Convention | Example |
|--------|-----------|---------|
| Feature folders | kebab-case | `user-profile`, `checkout` |
| Components | PascalCase | `ProductCard.tsx`, `CheckoutForm.tsx` |
| Hooks | camelCase + `use` prefix | `useProducts.ts`, `useCart.ts` |
| Services | camelCase + `.service` | `product.service.ts` |
| Stores | camelCase + `.store` | `cart.store.ts` |
| Types | camelCase + `.types` | `product.types.ts` |
| Utils | camelCase + `.utils` | `price.utils.ts` |
| Pages | PascalCase + `Page` | `ProductListPage.tsx` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS` |
| Route paths | UPPER_SNAKE_CASE | `ROUTES.PRODUCT_DETAIL` |

---

## 3. Feature Rules

### Boundaries

| Feature | Owns |
|---------|------|
| `auth` | login, register, logout, auth state (user, token) |
| `user-profile` | addresses CRUD, profile settings |
| `product` | categories tree, listing, detail, variants display |
| `cart` | cart state, add/remove/update, guest cart |
| `checkout` | checkout flow, address selection, order creation |
| `order` | order history, order detail, cancel order |
| `review` | reviews list, create/edit review |

### Cross-feature Communication

✅ **DO** — export only via `index.ts`, import from barrel:
```typescript
// ✅ import from feature barrel
import { ProductCard } from '@/features/product';

// ❌ import from internal file
import { ProductCard } from '@/features/product/components/ProductCard';
```

✅ **DO** — share state via Zustand (auth, cart only) or URL params:
```typescript
// auth state consumed by cart/checkout via Zustand
const { user } = useAuthStore();

// filters/pagination via URL — not stored in Zustand
const [searchParams, setSearchParams] = useSearchParams();
```

❌ **DON'T** — store server data in Zustand:
```typescript
// ❌ redundant — TanStack Query already caches this
const products = useProductStore((s) => s.products);

// ✅ use TanStack Query cache
const { data: products } = useProducts();
```

---

## 4. Component Rules

- One component per file
- Props typing required (`interface Props {}`)
- Max 200 lines — split into sub-components if larger
- Separate container (logic) vs presentational (UI) when complex
- Use `React.memo()` only after measuring a real perf issue

**Component structure:**
```tsx
// 1. Imports
import { useState } from 'react';
import type { Product } from '../types/product.types';

// 2. Types
interface Props {
  product: Product;
  onAddToCart: (variantId: number) => void;
}

// 3. Component
export function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      ...
    </div>
  );
}

// 4. Export (named preferred; default only for pages/routes)
```

---

## 5. Code Patterns

### Routing (React Router v7)

```typescript
// routes/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
} as const;
```

```tsx
// ✅ DO — import from 'react-router' (NOT 'react-router-dom')
import { useNavigate, useParams, useSearchParams, Outlet } from 'react-router';

// Type-safe params
const { slug } = useParams<{ slug: string }>();

// Search params for filters (not Zustand)
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get('page') ?? 1);

// Programmatic navigation
navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', slug));

// ProtectedRoute
export function ProtectedRoute() {
  const { user } = useAuthStore();
  return user ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}
```

### API Calls — services + TanStack Query hooks only

```typescript
// ✅ DO — service file
// features/product/services/product.service.ts
export const productService = {
  getAll: (params: ProductQuery) =>
    api.get<PaginatedResponse<Product>>('/products', { params }),
  getBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`),
};

// ✅ DO — TanStack Query hook
// features/product/hooks/useProducts.ts
export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  });
}

// ✅ DO — use hook in component
function ProductListPage() {
  const { data, isLoading } = useProducts({ page: 1, limit: 20 });
}

// ❌ DON'T — fetch in component
function ProductListPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { axios.get('/products').then(...) }, []); // ❌
}
```

### Mutations — POST / PUT / DELETE

```typescript
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

### Forms — React Hook Form + Zod

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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('addressId')} />
      {errors.addressId && <p className="text-red-500 text-sm">{errors.addressId.message}</p>}
    </form>
  );
}
```

### State Management

```typescript
// ✅ Local state first
const [isOpen, setIsOpen] = useState(false);

// ✅ Server state → TanStack Query
const { data: orders } = useOrders();

// ✅ Global client state → Zustand (auth + cart only)
const { user, setUser } = useAuthStore();
const { items, addItem } = useCartStore();

// ✅ Filter/pagination state → URL
const [searchParams, setSearchParams] = useSearchParams();
```

### Authentication

```typescript
// Axios interceptor — auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await authService.refresh();   // refresh_token via httpOnly cookie
      return api.request(err.config);
    }
    return Promise.reject(err);
  }
);

// Access token in memory only (never localStorage)
let accessToken: string | null = null;
export const setAccessToken = (token: string) => { accessToken = token; };
```

### Loading & Error States

```tsx
// Skeleton for initial load
function ProductListPage() {
  const { data, isLoading } = useProducts(params);
  if (isLoading) return <ProductListSkeleton />;
  return <ProductList products={data} />;
}

// errorElement at route level
{
  path: ROUTES.PRODUCTS,
  element: <ProductListPage />,
  errorElement: <RouteErrorPage />,
}
```

---

## 6. Anti-patterns — MUST NOT Do

| ❌ Anti-pattern | ✅ Correct approach |
|----------------|-------------------|
| Import from feature internal files | Import from `index.ts` barrel |
| API calls directly in components | Use service + TanStack Query hook |
| Business logic in components | Move to hooks or utils |
| `useEffect` for data fetching | Use `useQuery` |
| Store server data in Zustand | Use TanStack Query cache |
| Hardcoded API URLs | Use `config/constants.ts` |
| Hardcoded route paths | Use `ROUTES` constants |
| `import from 'react-router-dom'` | Use `'react-router'` (v7) |
| Auth tokens in `localStorage` | Access token in memory; refresh in httpOnly cookie |
| Inline styles | Use Tailwind classes |
| `any` types | Enable strict mode, type everything |
| List keys using index | Use unique `item.id` as key |

---

## 7. Git Workflow

**Branch naming:** `[type]/[feature]-[short-description]`
```
feature/cart-guest-merge
fix/checkout-address-validation
refactor/product-list-pagination
```

**Commit messages:** `[type]: [description]`
```
feat: add product variant selector
fix: correct cart quantity update
style: improve checkout form layout
```

**PR requirements:**
- One feature or fix per PR
- Include screenshots for UI changes
- Update `CONTEXT.md` if feature logic changes

---

## 8. Testing

- Test files co-located: `[Component].test.tsx`
- Tools: **Vitest** + **React Testing Library**
- Use `MemoryRouter` for route-dependent tests

```tsx
describe('CheckoutForm', () => {
  it('should show error when no address selected', async () => {
    render(<CheckoutForm />, { wrapper: MemoryRouter });
    await userEvent.click(screen.getByRole('button', { name: /place order/i }));
    expect(screen.getByText('Select an address')).toBeInTheDocument();
  });
});
```

**Coverage focus:**

| Area | Priority |
|------|----------|
| Checkout flow | Critical |
| Cart operations | High |
| Auth flow | High |
| Pure UI components | Skip |
| Third-party wrappers | Skip |

**What to test:** user interactions, conditional rendering, hook behavior, API integration (mock service), route navigation.
