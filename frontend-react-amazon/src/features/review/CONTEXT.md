# Review Feature — CONTEXT.md

## Responsibility
Product reviews list, create/edit review (verified purchase only)

## API Mapping
| Action | Endpoint |
|--------|----------|
| List reviews | `GET /products/:id/reviews` |
| Create review | `POST /products/:id/reviews` (requires auth + verified purchase) |
| Update review | `PATCH /reviews/:id` |
| Delete review | `DELETE /reviews/:id` |

## Business Rules
- Review creation requires `orderId` of a verified purchase
- One review per (user, product, order) — duplicate → show error `REV_001`
- User can only edit/delete their own reviews
- Rating: 1–5 stars

## Dependencies
- `auth` — `useAuthStore` to check auth and user identity
- `product` — product context (rendered inside ProductDetailPage)
- `order` — `orderId` passed when creating a review

## Exports (via index.ts)
- `ReviewList`, `ReviewForm`
- Types: `Review`, `CreateReviewRequest`
