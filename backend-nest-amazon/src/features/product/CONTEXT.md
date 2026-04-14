# Product Feature — CONTEXT.md

## Entities
- `categories` — self-referencing tree (parent_id)
- `products` — catalog items with `category_id` FK
- `product_variants` — SKU-level stock/price records linked to `product_id`
- `product_images` — ordered images linked to `product_id`

## Business Rules
- Cart items and order items MUST reference `product_variants`, never `products`
- Soft-delete products via `is_active = false` — never hard delete
- `product_variants.stock_quantity` decremented atomically at checkout (QueryRunner)
- Admin-only: create/update/delete categories, products, variants, images

## Edge Cases
- Product not found → 404 PROD_001
- Variant not found → 404 PROD_002
- Insufficient stock at checkout → 400 PROD_003

## Exports
- `ProductModule` exports `ProductVariantRepository` for `CartModule` and `OrderModule`
