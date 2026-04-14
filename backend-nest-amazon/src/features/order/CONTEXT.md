# Order Feature — CONTEXT.md

## Entities
- `orders` — order header; `shipping_address` is a JSON snapshot (not FK)
- `order_items` — line items with product snapshots (name, sku, price, thumbnail)

## Business Rules
- Checkout runs in a single `QueryRunner` transaction:
  1. Validate all cart items have sufficient stock
  2. Snapshot product info → `order_items` (name, sku, price, thumbnail)
  3. Snapshot address → `orders.shipping_address` JSON (NOT FK to addresses)
  4. Decrement `stock_quantity` in `product_variants`
  5. Clear cart after successful commit
- Cancel only allowed when `status = pending` → 400 ORD_002 otherwise
- Admin can update order status and payment status

## Edge Cases
- Order not found → 404 ORD_001
- Cancel when already shipped → 400 ORD_002

## Dependencies
- `ProductModule` — `ProductVariantRepository` for stock validation and decrement
- `CartModule` — `CartRepository` for cart resolution and clearing
- `UserProfileModule` — `AddressRepository` for address snapshot
