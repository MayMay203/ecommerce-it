# FE-PROJECT-RULES.md

## Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **State management:** Zustand (global) + TanStack Query (server state)
- **Styling:** Tailwind CSS
- **HTTP client:** Axios
- **Forms:** React Hook Form + Zod

---

## 1. Feature Structure

```
src/features/[feature-name]/
├── components/         # UI components used only by this feature
├── hooks/              # Data-fetching hooks (wrap TanStack Query)
├── services/           # Axios calls — one file per feature
├── stores/             # Zustand slice (only if feature needs global state)
├── types/              # Feature-local TypeScript types
├── utils/              # Feature-local pure helpers
├── pages/              # Route-level components (one per route)
├── index.ts            # Barrel — ONLY export what other features need
└── context.md          # Plain-English feature summary for new devs
```

---

## 2. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Feature folders | `kebab-case` | `product-detail/` |
| Component files | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook files | `camelCase`, `use` prefix | `useProductDetail.ts` |
| Service files | `camelCase.service.ts` | `products.service.ts` |
| Store files | `camelCase.store.ts` | `cart.store.ts` |
| Type files | `camelCase.types.ts` | `order.types.ts` |
| Page files | `PascalCase.page.tsx` | `CheckoutPage.tsx` |
| Zod schemas | `camelCase.schema.ts` | `checkout.schema.ts` |

---

## 3. Feature Rules

- Export **only via `index.ts`** — never import internal paths from outside the feature
- No direct imports between features — use shared store, URL params, or props

**DO:**
```typescript
// ✅ from another feature — import via barrel
import { CartSummary } from '@/features/cart';
```

**DON'T:**
```typescript
// ❌ internal path leak
import { CartItemRow } from '@/features/cart/components/CartItemRow';
```

- Shared UI components → `src/shared/components/`
- Shared hooks → `src/shared/hooks/`
- Shared Axios client → `src/shared/services/api.ts`

---

## 4. Component Rules

- **One component per file**, filename matches component name
- **All props must be typed** — no implicit `any`, no untyped children
- **Max ~150 lines** — extract sub-components if longer
- Co-locate test: `ProductCard.test.tsx` beside `ProductCard.tsx`

```typescript
// DO
interface ProductCardProps {
  product: ProductSummary;
  onAddToCart: (variantId: number) => void;
}
export function ProductCard({ product, onAddToCart }: ProductCardProps) { ... }

// DON'T
export function ProductCard({ product, onAddToCart }: any) { ... }  // ❌
```

---

## 5. Code Patterns (MUST follow)

### API calls — via service files only
```typescript
// ✅ products.service.ts
export const productsService = {
  getList: (params: ProductListParams) => api.get<ProductListResponse>('/products', { params }),
  getById: (id: number) => api.get<ProductDetail>(`/products/${id}`),
};

// ❌ DON'T call axios directly in components or hooks
axios.get('/products');
```

### Data fetching — via TanStack Query hooks
```typescript
// ✅ hooks/useProductList.ts
export function useProductList(params: ProductListParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getList(params),
  });
}
```

### State — local first, global only when necessary
```typescript
// ✅ local — modal visibility stays in component
const [isOpen, setIsOpen] = useState(false);

// ✅ global — cart must be accessible across features
const { items, addItem } = useCartStore();
```

### Form handling
```typescript
// ✅ React Hook Form + Zod schema
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
const { register, handleSubmit } = useForm<LoginForm>({ resolver: zodResolver(schema) });
```

### Error handling
- Axios errors → caught in service layer, re-thrown as typed `ApiError`
- Query errors → displayed via toast notification in a global `QueryErrorBoundary`
- Form errors → inline field messages via React Hook Form

### Loading states
- List pages → skeleton (preserve layout)
- Mutations (submit button) → spinner + disabled state

---

## 6. Anti-patterns (MUST NOT do)

| Anti-pattern | Why |
|-------------|-----|
| API calls directly in components | Untestable, breaks separation of concerns |
| Business logic in components | Components = rendering only |
| Import from another feature's internal path | Breaks encapsulation |
| Deep prop drilling (>2 levels) | Use context or Zustand slice |
| `any` type | Defeats TypeScript; use `unknown` + type guard |
| Inline styles (`style={{}}`) | Use Tailwind utilities; inline only for dynamic values |
| Zustand for server data | Use TanStack Query for all API-fetched data |

---

## 7. Git Workflow

- **Branch naming:** `<type>/<description>` — `feat/cart-merge`, `fix/checkout-total`
- **Commit message:** Conventional Commits — `feat(cart): add merge on login`, `fix(products): show sale price`
- **PR scope:** One feature or one bug fix per PR — no cross-feature PRs unless intentional
- **PR requirements:** No `console.log`, no `any`, passes `npm run lint` and `npm run test`

---

## 8. Testing

- Test files co-located: `ComponentName.test.tsx` beside the component
- **Unit test:** pure utils + hooks (mock service layer with `vi.fn()`)
- **Component test:** React Testing Library — test user interactions, not implementation
- **What to test:** user-visible behaviour (click, submit, render), not internal state

```typescript
it('should add item to cart when "Add to Cart" is clicked', async () => {
  render(<ProductCard product={mockProduct} onAddToCart={mockFn} />);
  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));
  expect(mockFn).toHaveBeenCalledWith(mockProduct.variants[0].id);
});
```

- **Coverage focus:** hooks ≥ 80%, utils 100%, components ≥ 60%
- Run: `npm run test` | `npm run test:coverage`
