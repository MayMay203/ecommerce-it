# Order Feature — CONTEXT.md

## Overview
Order management system for e-commerce platform. Handles order creation from checkout, order listing, order details, and order status management.

## Entities
- **Order** — Core order entity with status, payment info, and address snapshot
  - `id`, `userId`, `status`, `paymentMethod`, `paymentStatus`, `shippingFee`, `totalAmount`, `shippingAddress` (JSON), `createdAt`
  - Relations: `user`, `orderItems`
- **OrderItem** — Order line items with product variant snapshot data
  - `id`, `orderId`, `productVariantId`, `productName`, `sku`, `price`, `quantity`, `thumbnailUrl`
  - Relations: `order`, `productVariant`

## API Endpoints

### User Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/orders/checkout` | Create order from cart | Yes |
| GET | `/orders` | List user's orders (paginated) | Yes |
| GET | `/orders/:id` | Get order details | Yes |
| PATCH | `/orders/:id/cancel` | Cancel pending order | Yes |

### Admin Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/admin/orders` | List all orders (filterable) | Admin |
| PATCH | `/admin/orders/:id/status` | Update order status | Admin |
| PATCH | `/admin/orders/:id/payment` | Update payment status | Admin |

## Business Rules

### Checkout (`POST /orders/checkout`)
1. Validate cart exists and not empty
2. Validate all items have sufficient stock
3. Calculate total (items + shipping fee = 10)
4. Create Order + OrderItems (snapshot data)
5. Decrement variant stock quantities
6. Clear cart items
7. All steps in single transaction (QueryRunner)

### Order Cancellation (`PATCH /orders/:id/cancel`)
- Only `pending` orders can be cancelled
- Cancelling does NOT restore stock in v1
- Returns order with updated status

### Snapshot Data
- `order_items` stores: `productName`, `sku`, `price`, `thumbnailUrl` (from product_variant at order time)
- `orders.shippingAddress` is JSON, not FK — decouples from addresses table

## Dependencies
- `CartModule` — `CartRepository` for cart fetching and clearing
- `ProductModule` — `ProductVariantRepository` for stock validation and product details
- `DataSource` — QueryRunner for transactional checkout

## Error Codes
- `CART_002` (400) — Cart is empty
- `PROD_002` (404) — Variant not found
- `PROD_003` (400) — Insufficient stock
- `ORD_001` (404) — Order not found
- `ORD_002` (400) — Cannot cancel (not pending status)
