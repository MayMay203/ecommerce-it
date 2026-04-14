# Product Feature — CONTEXT.md

## Responsibility
Category tree, product listing, product detail, variant display

## API Mapping
| Action | Endpoint |
|--------|----------|
| List categories | `GET /categories` |
| Category with products | `GET /categories/:slug` |
| List products (filterable) | `GET /products?page=&limit=&category_id=&min_price=&max_price=` |
| Product detail | `GET /products/:slug` |
| Product variants | `GET /products/:id/variants` |
| Variant detail | `GET /variants/:id` |

## State
- Server data cached by TanStack Query — NEVER Zustand
- Filters/pagination via `useSearchParams` — NOT Zustand

## Business Rules
- Products show variants for price/stock; cart links to `product_variant_id`
- Soft-deleted products (`is_active = false`) should not appear
- Variant price display: use `sale_price` if set, else `price`

## Exports (via index.ts)
- `ProductListPage`, `ProductDetailPage`
- `ProductCard`, `VariantSelector`
- Types: `Product`, `ProductVariant`, `Category`
