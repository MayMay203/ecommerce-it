# Order Feature — CONTEXT.md

## Responsibility
- Order listing with pagination and filtering
- Order detail view with items breakdown and pricing
- Order cancellation (pending orders only)
- Order history management

## API Endpoints
| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| List orders | GET | `/orders` | Paginated, filterable by status |
| Order detail | GET | `/orders/:id` | Single order with items |
| Create order | POST | `/orders/checkout` | From cart, creates snapshot |
| Cancel order | PATCH | `/orders/:id/cancel` | Only when `status = 'pending'` |

## Components
- `OrderList` — Grid of order cards
- `OrderCard` — Individual order summary with status badge
- `OrderDetail` — Full order details with items breakdown and pricing

## Hooks
- `useOrders(page, limit, status?)` — Paginated order list with TanStack Query
- `useOrder(orderId)` — Single order detail
- `useCheckout()` — Create order mutation (clears cart on success)
- `useCancelOrder()` — Cancel order mutation

## Pages
- `OrderListPage` — List all orders with filters and pagination
- `OrderDetailPage` — View single order, cancel if pending

## Business Rules
- Cancel only available when `status = 'pending'`
- Orders display snapshot data (not live product/address data)
- `shipping_address` is a JSON snapshot from order time
- Total = subtotal + shipping fee
- OrderItems store product snapshots: name, sku, price, quantity, thumbnail

## Dependencies
- `auth` — User identity (protected routes)
- `cart` — Cart clearing on successful checkout
- `product` — Product images/variants (read-only for snapshots)

## Exports (via index.ts)
- Pages: `OrderListPage`, `OrderDetailPage`
- Components: `OrderList`, `OrderCard`, `OrderDetail`
- Hooks: `useOrders`, `useOrder`, `useCheckout`, `useCancelOrder`
- Service: `orderService`
- Types: `Order`, `OrderItem`, `OrderStatus`, `PaymentStatus`
