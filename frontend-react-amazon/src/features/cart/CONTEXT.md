# Cart Feature — CONTEXT.md

## Responsibility
Cart state management, add/remove/update items, guest cart support

## API Mapping
| Action | Endpoint |
|--------|----------|
| Get cart | `GET /cart` |
| Add item | `POST /cart/items` |
| Update quantity | `PATCH /cart/items/:id` |
| Remove item | `DELETE /cart/items/:id` |
| Clear cart | `DELETE /cart` |
| Merge guest cart | `POST /cart/merge` (called after login) |

## State
- Cart data → TanStack Query (`['cart']` key)
- `cart.store.ts` (Zustand) → only `cartCount` for header badge
- Guest cart uses `session_id` cookie (set by server)

## Business Rules
- Items reference `product_variant_id`, not `product_id`
- Optimistic updates on add/remove for instant UI feedback
- Merge guest cart into user cart immediately after login
- `cartCount` in Zustand updated on successful cart mutations

## Dependencies
- `auth` — `useAuthStore` to know if user is authenticated (for merge)
- `product` — variant info for display

## Exports (via index.ts)
- `CartPage`, `CartIcon`, `CartDrawer`
- `useCart`, `useAddToCart`
- Types: `Cart`, `CartItem`
