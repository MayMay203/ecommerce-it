# Order Feature — CONTEXT.md

## Responsibility
Order history list, order detail view, cancel order

## API Mapping
| Action | Endpoint |
|--------|----------|
| List orders | `GET /orders` |
| Order detail | `GET /orders/:id` |
| Cancel order | `PATCH /orders/:id/cancel` |

## Business Rules
- Cancel only available when `status = 'pending'`
- Orders display snapshot data (not live product/address data)
- `shipping_address` is a JSON snapshot stored at order time

## Dependencies
- `auth` — `useAuthStore` for user identity (protected route)

## Exports (via index.ts)
- `OrderListPage`, `OrderDetailPage`
- Types: `Order`, `OrderItem`
