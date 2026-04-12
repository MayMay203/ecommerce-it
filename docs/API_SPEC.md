# API_SPEC.md

## 1. Overview

- **Base URL:** `http://localhost:3000/api/v1` (dev) | `https://api.ecommerce.com/api/v1` (prod)
- **Versioning:** URL prefix `/v1` — bump to `/v2` only for breaking changes
- **Content-Type:** `application/json` for all requests/responses
- **File uploads:** `multipart/form-data` (product images only)

---

## 2. Authentication

**Method:** JWT Bearer Token

```
Authorization: Bearer <access_token>
```

**Token flow:**

```
POST /auth/login → { access_token, refresh_token }
     │
     ├── access_token  — short-lived (15m), sent in Authorization header
     └── refresh_token — long-lived (7d), sent in body to POST /auth/refresh

POST /auth/refresh → { access_token }   (rotation: new access_token issued)
```

**Auth error responses:**

| Scenario | HTTP | Error Code |
|----------|------|------------|
| Missing token | 401 | `AUTH_001` |
| Invalid / malformed token | 401 | `AUTH_002` |
| Expired token | 401 | `AUTH_003` |
| Insufficient role | 403 | `AUTH_004` |

---

## 3. Request Conventions

**Pagination (list endpoints):**
```
GET /products?page=1&limit=20
```
| Param | Default | Notes |
|-------|---------|-------|
| `page` | `1` | 1-based |
| `limit` | `20` | max `100` |

**Sorting:**
```
GET /products?sort=price&order=asc
```

**Filtering:**
```
GET /products?category_id=3&min_price=100&max_price=500&keyword=shirt
```

**Request body:** JSON with `camelCase` keys
**File upload:** `multipart/form-data`, field name `file` or `files[]`

---

## 4. Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```
> `meta` only present on paginated list responses.

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_001",
    "message": "Product not found",
    "details": []
  }
}
```
> `details` contains field-level validation errors (array of `{ field, message }`).

---

## 5. Error Codes

**Format:** `<FEATURE>_<3-DIGIT-NUMBER>`

**Common errors:**

| Code | HTTP | Message |
|------|------|---------|
| `AUTH_001` | 401 | Missing authorization token |
| `AUTH_002` | 401 | Invalid token |
| `AUTH_003` | 401 | Token expired |
| `AUTH_004` | 403 | Insufficient permissions |
| `COMMON_001` | 400 | Validation failed |
| `COMMON_002` | 404 | Resource not found |
| `COMMON_003` | 409 | Resource already exists |
| `COMMON_004` | 500 | Internal server error |

**Feature-specific ranges:**

| Feature | Range |
|---------|-------|
| auth | `AUTH_001–099` |
| users | `USER_001–099` |
| products | `PRODUCT_001–099` |
| categories | `CATEGORY_001–099` |
| cart | `CART_001–099` |
| orders | `ORDER_001–099` |
| reviews | `REVIEW_001–099` |

---

## 6. Endpoints by Feature

### Auth
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Register new customer account | No |
| POST | `/auth/login` | Login, receive tokens | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Invalidate refresh token | Yes |

### Users
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/users/me` | Get current user profile | User |
| PATCH | `/users/me` | Update profile | User |
| GET | `/users/me/addresses` | List saved addresses | User |
| POST | `/users/me/addresses` | Add address | User |
| PATCH | `/users/me/addresses/:id` | Update address | User |
| DELETE | `/users/me/addresses/:id` | Delete address | User |
| GET | `/admin/users` | List all users | Admin |
| PATCH | `/admin/users/:id/status` | Ban / activate user | Admin |

### Categories
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/categories` | List all categories (tree) | No |
| POST | `/admin/categories` | Create category | Admin |
| PATCH | `/admin/categories/:id` | Update category | Admin |
| DELETE | `/admin/categories/:id` | Delete category | Admin |

### Products
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/products` | List products (paginated, filterable) | No |
| GET | `/products/:id` | Product detail with variants & images | No |
| POST | `/admin/products` | Create product | Admin |
| PATCH | `/admin/products/:id` | Update product | Admin |
| DELETE | `/admin/products/:id` | Soft-delete product | Admin |
| POST | `/admin/products/:id/images` | Upload product images | Admin |
| POST | `/admin/products/:id/variants` | Add variant | Admin |
| PATCH | `/admin/products/:id/variants/:variantId` | Update variant | Admin |

### Cart
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/cart` | Get current cart | No* |
| POST | `/cart/items` | Add item to cart | No* |
| PATCH | `/cart/items/:itemId` | Update item quantity | No* |
| DELETE | `/cart/items/:itemId` | Remove item | No* |
| POST | `/cart/merge` | Merge guest cart after login | User |

> *Guest cart uses `session_id` cookie. Authenticated requests use JWT user context.

### Orders
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/orders` | Place order (checkout) | User |
| GET | `/orders` | List my orders | User |
| GET | `/orders/:id` | Order detail | User |
| POST | `/orders/:id/cancel` | Cancel order | User |
| GET | `/admin/orders` | List all orders | Admin |
| PATCH | `/admin/orders/:id/status` | Update order status | Admin |

### Reviews
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/products/:id/reviews` | List product reviews | No |
| POST | `/products/:id/reviews` | Submit review (must have bought) | User |

---

## 7. Endpoint Details

### POST `/auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "Passw0rd!",
  "full_name": "Nguyen Van A",
  "phone": "0901234567"
}
```
**Response `201`:**
```json
{
  "success": true,
  "data": { "id": 1, "email": "user@example.com", "full_name": "Nguyen Van A" }
}
```
**Errors:** `AUTH_005` email already registered → `409`

---

### POST `/auth/login`
**Request:**
```json
{ "email": "user@example.com", "password": "Passw0rd!" }
```
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": { "id": 1, "email": "user@example.com", "role": "customer" }
  }
}
```
**Errors:** `AUTH_006` invalid credentials → `401`

---

### GET `/products`
**Query params:** `page`, `limit`, `category_id`, `keyword`, `min_price`, `max_price`, `sort` (`price`|`created_at`), `order` (`asc`|`desc`)

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "Classic White Tee",
      "slug": "classic-white-tee",
      "thumbnail_url": "https://...",
      "min_price": 150000,
      "max_price": 200000,
      "category": { "id": 3, "name": "T-Shirts" }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 84 }
}
```

---

### POST `/orders` (Checkout)
**Request:**
```json
{
  "address_id": 5,
  "payment_method": "cod",
  "items": [
    { "product_variant_id": 22, "quantity": 2 }
  ]
}
```
**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "status": "pending",
    "payment_method": "cod",
    "payment_status": "unpaid",
    "shipping_fee": 30000,
    "total_amount": 330000,
    "items": [
      { "product_name": "Classic White Tee", "sku": "CWT-M-WHT", "price": 150000, "quantity": 2 }
    ]
  }
}
```
**Errors:**

| Code | HTTP | Scenario |
|------|------|----------|
| `ORDER_001` | 400 | Cart is empty |
| `ORDER_002` | 422 | Insufficient stock for variant |
| `ORDER_003` | 404 | Address not found |
| `PRODUCT_002` | 404 | Product variant not found |

---

### POST `/products/:id/reviews`
**Request:**
```json
{ "order_id": 101, "rating": 5, "comment": "Great quality!" }
```
**Errors:**

| Code | HTTP | Scenario |
|------|------|----------|
| `REVIEW_001` | 403 | Order does not belong to current user |
| `REVIEW_002` | 409 | Already reviewed this product for this order |
| `REVIEW_003` | 422 | Order not delivered yet |
