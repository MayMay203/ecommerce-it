# BE-API_SPEC.md — ecommerce Backend

## 1. Overview

- **Base URL:** `/api/v1`
- **Versioning:** URL path — `/api/v1/`, `/api/v2/`
- **Content-Type:** `application/json`
- **Encoding:** UTF-8

---

## 2. Authentication

- **Method:** JWT Bearer Token
- **Header:** `Authorization: Bearer <access_token>`

| Token | TTL | Storage |
|-------|-----|---------|
| Access token | 15 minutes | Memory / localStorage |
| Refresh token | 7 days | `httpOnly` cookie |

**Token flow:**
1. Login → receive `access_token` (body) + `refresh_token` (httpOnly cookie)
2. Access token expires → `POST /auth/refresh` → new access token
3. Logout → server sets `is_revoked = true` on current refresh token

**Auth errors:**
- `401 Unauthorized` — missing / invalid / expired token
- `403 Forbidden` — valid token, insufficient role

**Public routes (no auth required):**
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- `GET /products`, `GET /products/:slug`, `GET /categories`, `GET /categories/:slug`
- `GET /products/:id/reviews`, `GET /variants/:id`
- Cart endpoints (guest session-based, no login needed)

---

## 3. Request Conventions

**Pagination:**
```
GET /products?page=2&limit=20
```
- `page`: default `1` | `limit`: default `10`, max `100`

**Sorting:**
```
GET /products?sort=created_at&order=desc
```

**Filtering:**
```
GET /products?category_id=5&is_active=true
GET /products?min_price=100&max_price=500
GET /admin/orders?status=pending,confirmed
```

**Request body:** JSON, `camelCase` fields (backend transforms to `snake_case` via TypeORM)

**File upload:**
- `Content-Type: multipart/form-data`
- Field: `file` (single) | `files` (multiple)
- Max: 5MB per file | Allowed: `image/jpeg`, `image/png`, `image/webp`

---

## 4. Response Format

```jsonc
// Success — single item
{
  "success": true,
  "data": { },
  "message": "Optional success message"
}

// Success — paginated list
{
  "success": true,
  "data": [ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": { }   // optional — validation error breakdown
  }
}
```

---

## 5. Error Codes

Format: `[FEATURE]_[NUMBER]`

| Code | HTTP | Description |
|------|------|-------------|
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 401 | Token invalid |
| AUTH_004 | 403 | Insufficient permissions |
| AUTH_005 | 409 | Email already exists |
| USER_001 | 404 | Address not found |
| PROD_001 | 404 | Product not found |
| PROD_002 | 404 | Variant not found |
| PROD_003 | 400 | Insufficient stock |
| CART_001 | 404 | Cart not found |
| CART_002 | 400 | Cart is empty |
| ORD_001 | 404 | Order not found |
| ORD_002 | 400 | Cannot cancel — order already shipped |
| REV_001 | 400 | Already reviewed this product |
| REV_002 | 403 | Must purchase before reviewing |
| SYS_001 | 500 | Internal server error |
| SYS_002 | 400 | Validation error |

**HTTP status summary:**

| Status | Usage |
|--------|-------|
| 200 | GET, PATCH success |
| 201 | POST — resource created |
| 204 | DELETE — no content |
| 400 | Bad request / validation |
| 401 | Unauthenticated |
| 403 | Authenticated but forbidden |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |

---

## 6. Endpoints by Feature

### Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login, receive tokens | No |
| POST | `/auth/refresh` | Refresh access token via cookie | No |
| POST | `/auth/logout` | Revoke current refresh token | Yes |
| GET | `/auth/me` | Get current user profile | Yes |
| PATCH | `/auth/me` | Update current user profile | Yes |
| PATCH | `/auth/change-password` | Change password | Yes |

---

### User Profile (Addresses)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/addresses` | List user's addresses | Yes |
| POST | `/addresses` | Create new address | Yes |
| GET | `/addresses/:id` | Get address detail | Yes |
| PATCH | `/addresses/:id` | Update address | Yes |
| DELETE | `/addresses/:id` | Delete address | Yes |
| PATCH | `/addresses/:id/default` | Set as default address | Yes |

---

### Product — Public

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/categories` | List categories (nested tree) | No |
| GET | `/categories/:slug` | Get category with products | No |
| GET | `/products` | List products (paginated, filterable) | No |
| GET | `/products/:slug` | Get product detail with variants | No |
| GET | `/products/:id/variants` | List product variants | No |
| GET | `/variants/:id` | Get variant detail (stock, price) | No |

### Product — Admin

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/admin/categories` | Create category | Admin |
| PATCH | `/admin/categories/:id` | Update category | Admin |
| DELETE | `/admin/categories/:id` | Delete category | Admin |
| POST | `/admin/products` | Create product | Admin |
| PATCH | `/admin/products/:id` | Update product | Admin |
| DELETE | `/admin/products/:id` | Soft delete product | Admin |
| POST | `/admin/products/:id/variants` | Create variant | Admin |
| PATCH | `/admin/variants/:id` | Update variant (stock, price) | Admin |
| POST | `/admin/products/:id/images` | Upload product images | Admin |
| DELETE | `/admin/images/:id` | Delete product image | Admin |

---

### Cart

> Guest cart uses `session_id` cookie; authenticated users resolve by `user_id`.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/cart` | Get current cart | No* |
| POST | `/cart/items` | Add item to cart | No* |
| PATCH | `/cart/items/:id` | Update item quantity | No* |
| DELETE | `/cart/items/:id` | Remove item from cart | No* |
| DELETE | `/cart` | Clear cart | No* |
| POST | `/cart/merge` | Merge guest cart after login | Yes |

---

### Order

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/orders` | List user's orders | Yes |
| GET | `/orders/:id` | Get order detail | Yes |
| POST | `/orders/checkout` | Create order from cart | Yes |
| PATCH | `/orders/:id/cancel` | Cancel order (if pending) | Yes |
| GET | `/admin/orders` | List all orders (filterable) | Admin |
| PATCH | `/admin/orders/:id/status` | Update order status | Admin |
| PATCH | `/admin/orders/:id/payment` | Update payment status | Admin |

---

### Review

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/products/:id/reviews` | List product reviews | No |
| POST | `/products/:id/reviews` | Create review (verified purchase only) | Yes |
| PATCH | `/reviews/:id` | Update own review | Yes |
| DELETE | `/reviews/:id` | Delete own review | Yes |
| DELETE | `/admin/reviews/:id` | Delete any review | Admin |

---

## 7. Endpoint Details

### POST /auth/register

```jsonc
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "Nguyen Van A",
  "phone": "0901234567"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "customer"
  },
  "message": "Registration successful"
}
```

Error cases: `AUTH_005` (409 email exists), `SYS_002` (400 validation)

> Rate limiting: 5 requests / minute per IP via `@nestjs/throttler`.

---

### POST /auth/login

```jsonc
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "role": "customer"
    }
  }
}
// Set-Cookie: refresh_token=<hash>; HttpOnly; Secure; SameSite=Strict
```

Error cases: `AUTH_001` (401 invalid credentials)

---

### POST /orders/checkout

```jsonc
// Request
{
  "addressId": 5,
  "paymentMethod": "cod",
  "note": "Please call before delivery"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 100,
    "status": "pending",
    "paymentMethod": "cod",
    "paymentStatus": "unpaid",
    "shippingFee": 30000,
    "totalAmount": 530000,
    "shippingAddress": {
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "addressLine": "123 ABC Street",
      "city": "Ho Chi Minh"
    },
    "items": [
      {
        "productName": "Ao thun nam",
        "sku": "ATN-WHITE-L",
        "price": 250000,
        "quantity": 2,
        "thumbnailUrl": "https://cdn.example.com/img.jpg"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

Error cases: `CART_002` (400 empty cart), `PROD_003` (400 insufficient stock), `USER_001` (404 address not found)

**Business logic executed in `CheckoutService` (single `QueryRunner` transaction):**
1. Validate all cart items have sufficient `stock_quantity`
2. Snapshot product info (`name`, `sku`, `price`, `thumbnail`) → `order_items`
3. Snapshot address → `orders.shipping_address` JSON (NOT FK)
4. Decrement `stock_quantity` in `product_variants`
5. Clear cart after successful commit

---

### POST /products/:id/reviews

```jsonc
// Request
{
  "orderId": 100,
  "rating": 5,
  "comment": "Great product, fast delivery!"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 50,
    "rating": 5,
    "comment": "Great product, fast delivery!",
    "createdAt": "2024-01-20T15:00:00Z",
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A"
    }
  }
}
```

Error cases: `REV_002` (403 order doesn't contain product), `REV_001` (400 already reviewed), `ORD_001` (404 order not found)

**Verification logic:** Query `order_items` where `order_id = dto.orderId` AND `product_variant.product_id = :productId` — confirms verified purchase before allowing review.

---

## 8. NestJS Implementation Notes

**Swagger annotations:**
```typescript
@ApiTags('auth')
@ApiOperation({ summary: 'Register new user' })
@ApiResponse({ status: 201, description: 'Registration successful' })
@ApiResponse({ status: 409, description: 'AUTH_005 — Email already exists' })
```

**Controller param binding:**
```typescript
@Get()
findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sort') sort: string,
  @Query('order') order: 'asc' | 'desc' = 'desc',
) {}

@Post('checkout')
@UseGuards(JwtAuthGuard)
checkout(
  @CurrentUser() user: IUserPayload,
  @Body() dto: CheckoutDto,
) {}

@Patch(':id/status')
@Roles('admin')
updateStatus(
  @Param('id') id: number,
  @Body() dto: UpdateStatusDto,
) {}
```

**Rate limiting (auth routes):**
```typescript
// main.ts or auth.module.ts
app.use(new ThrottlerGuard());   // 5 req/min on /auth/login, /auth/register
```
