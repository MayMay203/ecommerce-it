# CLAUDE.md — Backend (NestJS)

> Also read: `../01-shared-docs/DATABASE.md` and `../01-shared-docs/API_SPEC.md`

## Project Overview

- **Framework:** NestJS v11 (modular monolith)
- **Language:** TypeScript (strict)
- **ORM:** TypeORM with MySQL 8.x
- **Auth:** JWT Bearer (access token 15m) + httpOnly cookie (refresh token 7d)
- **Base URL:** `/api/v1`

---

## Folder Structure

```
src/
├── main.ts                     # Bootstrap: global pipes, filters, interceptors
├── app.module.ts               # Root module
├── config/                     # app.config.ts, database.config.ts, jwt.config.ts
├── core/                       # database.module.ts, logger.module.ts
├── shared/
│   ├── decorators/             # @CurrentUser(), @Roles(), @Public()
│   ├── filters/                # HttpExceptionFilter (global)
│   ├── guards/                 # JwtAuthGuard, RolesGuard
│   ├── interceptors/           # TransformInterceptor, LoggingInterceptor
│   ├── pipes/                  # ValidationPipe config
│   ├── utils/                  # pagination.util.ts, hash.util.ts
│   └── types/                  # ApiResponse<T>, PaginationMeta
└── features/
    ├── auth/                   # roles, users, JWT, refresh tokens
    ├── user-profile/           # addresses
    ├── product/                # categories, products, variants, images
    ├── cart/                   # carts, cart_items, guest merge
    ├── order/                  # orders, order_items, checkout
    └── review/                 # reviews, ratings
```

Each feature folder:
```
features/[feature]/
├── [feature].module.ts
├── [feature].controller.ts      # or controllers/
├── [feature].service.ts         # or services/
├── repositories/
├── dto/
├── entities/
├── types/
├── tests/
└── CONTEXT.md
```

---

## Architecture Rules

### Layer Responsibilities

| Layer | Responsibility | Rules |
|-------|---------------|-------|
| Controller | Routing, DTO binding, call service | No business logic |
| Service | Business logic, orchestrate repos, transactions | No raw queries |
| Repository | TypeORM queries, QueryBuilder | No business logic |
| Guard | JWT validation, role checking | |
| Interceptor | Response wrapping, logging | |

### Cross-Feature Communication

**Allowed — NestJS DI via module exports:**
```typescript
// product.module.ts
@Module({ providers: [ProductVariantRepository], exports: [ProductVariantRepository] })

// order.module.ts
@Module({ imports: [ProductModule] })
```

**Allowed — EventEmitter for async side effects:**
```typescript
this.eventEmitter.emit('order.created', { orderId, userId });

@OnEvent('order.created')
handleOrderCreated(payload: OrderCreatedEvent) { ... }
```

**Forbidden:**
```typescript
import { UserService } from '../auth/auth.service'; // ❌ direct internal import
import { UserService } from '@features/auth';        // ✅ via module export
```

### Feature Dependency Map
```
auth          ← standalone
user-profile  ← auth
product       ← standalone
cart          ← auth, product
order         ← auth, product, cart
review        ← auth, product, order
```

---

## Coding Conventions

### Naming

| Target | Convention | Example |
|--------|-----------|---------|
| Feature folders | kebab-case | `user-profile` |
| Files | kebab-case | `create-user.dto.ts` |
| Classes | PascalCase | `UserService`, `CreateUserDto` |
| Methods / Variables | camelCase | `findById`, `userId` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS` |
| Interfaces / Types | PascalCase | `IUserPayload`, `OrderStatusType` |
| Entities | PascalCase singular | `User`, `ProductVariant` |

### Entity Pattern

```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true })
  variants: ProductVariant[];
}
```

### Controller Pattern

```typescript
@Post()
@UseGuards(JwtAuthGuard)
async create(@CurrentUser() user: IUserPayload, @Body() dto: CreateOrderDto) {
  const order = await this.orderService.create(user.id, dto);
  return { data: order, message: 'Order created successfully' };
}
```

### Service Pattern

```typescript
async checkout(userId: number, dto: CheckoutDto): Promise<Order> {
  const variant = await this.productVariantRepository.findByIdOrFail(dto.variantId);
  if (variant.stockQuantity < dto.quantity) {
    throw new BadRequestException('Insufficient stock');  // code: PROD_003
  }
  return this.orderRepository.createWithItems(userId, dto, variant);
}
```

### Repository Pattern

```typescript
async findOrdersWithItems(userId: number): Promise<Order[]> {
  return this.createQueryBuilder('order')
    .leftJoinAndSelect('order.orderItems', 'item')
    .where('order.userId = :userId', { userId })
    .orderBy('order.createdAt', 'DESC')
    .getMany();
}
```

### Transaction Pattern (multi-step writes)

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
  // 1. validate stock, 2. create order, 3. create items, 4. decrement stock, 5. clear cart
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

### DTO Validation

```typescript
export class CreateOrderDto {
  @IsInt() @Min(1)
  variantId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
// GlobalPipe: ValidationPipe({ transform: true, whitelist: true })
```

### Error Handling

```typescript
// Use NestJS built-in exceptions — global filter transforms to API error format
throw new NotFoundException(`Product #${id} not found`);   // PROD_001
throw new BadRequestException('Insufficient stock');         // PROD_003
throw new UnauthorizedException('Token revoked');            // AUTH_003
throw new ForbiddenException('Insufficient permissions');    // AUTH_004
```

Error code format: `[FEATURE]_[NUMBER]` — see `../01-shared-docs/API_SPEC.md § Error Codes`

### Logging

```typescript
// Only in services, not controllers
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  async create(...) { this.logger.log(`Creating order - userId: ${userId}`); }
}
```

---

## Database Rules

- **Tables:** snake_case plural (`users`, `product_variants`)
- **Columns:** snake_case (`created_at`, `user_id`)
- **PKs:** BIGINT AUTO_INCREMENT
- **Soft delete:** `is_active` (users, products), `is_revoked` (refresh_tokens)
- **Timestamps:** `@CreateDateColumn` / `@UpdateDateColumn` — never set manually
- **Enums:** stored as strings (`pending`, `paid`)
- **Avoid eager loading** — use explicit `relations` array in queries
- **Cart/Order items** link to `product_variants`, NEVER to `products`
- **Order shipping address** — snapshot to JSON, never FK to `addresses`
- **Order items** — snapshot `name`, `sku`, `price`, `thumbnail` at order time
- **Refresh tokens** — always store `token_hash`, never plain token

### Migration Rules

- Filename: `[timestamp]_[description].ts`
- Always implement both `up()` and `down()`
- `down()` must be fully reversible — no data loss on rollback
- Never edit an existing migration — create a new one

---

## API Response Format

```typescript
// Success (TransformInterceptor wraps automatically)
{ data: T, message?: string }

// Paginated
{ data: T[], meta: { page, limit, total, totalPages } }

// Error (HttpExceptionFilter formats automatically)
{ success: false, error: { code: 'PROD_001', message: '...', details?: {} } }
```

HTTP status codes: `200` GET/PATCH, `201` POST, `204` DELETE, `400` validation, `401` unauth, `403` forbidden, `404` not found, `409` conflict.

---

## Global Bootstrap (`main.ts`)

```typescript
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());
app.setGlobalPrefix('api/v1');
app.enableCors();
```

---

## Configuration

Required `.env` variables:
```
PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
JWT_SECRET, JWT_EXPIRES_IN=15m, JWT_REFRESH_EXPIRES_IN=7d
```

- Never commit `.env` — commit `.env.example` only
- Validate all vars at startup with Joi schema in `ConfigModule.forRoot()`
- Always inject via `ConfigService`, never `process.env` directly

---

## Testing

- Test files in `tests/` inside each feature — named `[name].spec.ts`
- Structure: `describe → it` with **Arrange-Act-Assert**
- Mock all external dependencies (DB, external APIs) in unit tests

Coverage targets: Services 80% | Controllers 70% | Repositories 60%

---

## Do

- Put business logic in **services**, queries in **repositories**, routing in **controllers**
- Use `QueryRunner` for any multi-step write operation (checkout, order creation)
- Use `@CurrentUser()`, `@Roles()`, `@Public()` decorators from `shared/decorators/`
- Add `CONTEXT.md` to every feature folder documenting entities, rules, edge cases
- Export only what other modules need — keep internals private
- Use `buildPaginationMeta()` from `shared/utils/pagination.util.ts` for all list responses
- Rate-limit auth routes: 5 req/min via `@nestjs/throttler`

## Don't

- Write raw SQL or `dataSource.query()` in services
- Import another feature's internal files — only via module DI exports
- Put `console.log` in code — use `Logger`
- Hardcode any config value — always use `ConfigService`
- Store plain-text passwords or tokens
- Reference `products` table in cart items or order items — always `product_variants`
- Store address FK in orders — always JSON snapshot
- Skip Swagger annotations (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) on controllers
