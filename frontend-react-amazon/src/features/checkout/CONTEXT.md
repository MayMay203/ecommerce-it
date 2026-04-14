# Checkout Feature — CONTEXT.md

## Responsibility
Checkout flow: address selection → payment method → place order

## API Mapping
| Action | Endpoint |
|--------|----------|
| Place order | `POST /orders/checkout` |

## Flow
1. User selects a shipping address (from user-profile addresses)
2. User selects payment method (COD or bank transfer)
3. On submit: `POST /orders/checkout` with `{ addressId, paymentMethod, note? }`
4. On success: `invalidateQueries(['cart'])` + navigate to order detail
5. On error: toast error, keep form intact

## Business Rules
- Cart must not be empty (`CART_002`)
- All variants must have sufficient stock (`PROD_003`)
- Address must belong to current user (`USER_001`)
- Form validated with React Hook Form + Zod before submit

## Dependencies
- `cart` — cart data for order summary display
- `user-profile` — address list for address selector

## Exports (via index.ts)
- `CheckoutPage`
- Types: `CheckoutRequest`
