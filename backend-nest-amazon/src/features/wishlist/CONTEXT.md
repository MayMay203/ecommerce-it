# Wishlist Feature — CONTEXT.md

## Entities
- `wishlists` — one row per user (lazily created on first add). `user_id` is UNIQUE.
- `wishlist_items` — links `wishlist_id` → `product_id`. UNIQUE `(wishlist_id, product_id)`.

## Business Rules
- Auth-only. No guest wishlist, no session cookie, no merge endpoint.
- Wishlist items reference `products` directly (not `product_variants`) — user wishes for a product and picks the variant at purchase time.
- Duplicates rejected with 409 Conflict. Both the service layer and the DB unique constraint enforce this (belt-and-braces for concurrent adds).
- DELETE uses `productId` (not wishlist-item id) so the frontend removes by the identity it already knows.

## Edge Cases
- Wishlist not found for user on remove → 404 `WISHLIST_001`
- Product already in wishlist → 409 `WISHLIST_002`
- Product does not exist → 404 (reuses `ProductService.findOne`)
- Remove non-member product → 404 `Product #<id> is not in wishlist`
- Clear on empty/missing wishlist → 200 (idempotent no-op)

## Error Codes
| Code | Status | Meaning |
|------|--------|---------|
| `WISHLIST_001` | 404 | Wishlist not found for the current user |
| `WISHLIST_002` | 409 | Product already in wishlist |

## Dependencies
- `ProductModule` — `ProductService.findOne()` for product existence validation
- `AuthModule` — global `JwtAuthGuard` and `@CurrentUser()` to resolve the acting user
