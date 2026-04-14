# Cart Feature — CONTEXT.md

## Entities
- `carts` — one cart per session; `user_id` is nullable (guest cart uses `session_id`)
- `cart_items` — line items linking `cart_id` → `product_variant_id`

## Business Rules
- Guest cart identified by `session_id` cookie
- Authenticated cart resolved by `user_id`
- `POST /cart/merge` merges guest cart into user cart on login
- Cart items reference `product_variants`, never `products`
- `cascade: true` on Cart → CartItem (delete cart removes all items)

## Edge Cases
- Cart not found → 404 CART_001
- Cart is empty at checkout → 400 CART_002

## Dependencies
- `ProductModule` — `ProductVariantRepository` for stock/price lookups
- `AuthModule` — user resolution for authenticated cart
