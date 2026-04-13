# PROJECT-RULES.md — Backend (Feature-based)

## Tech Stack
- **Language:** TypeScript
- **Framework:** NestJS v11
- **ORM:** TypeORM
- **Database:** MySQL 8.x

---

## 1. Feature Structure

```
src/
├── features/
│   ├── auth/           # roles, users, JWT, guards
│   ├── user-profile/   # addresses management
│   ├── product/        # categories, products, variants, images
│   ├── cart/           # carts, cart_items, guest cart merge
│   ├── order/          # orders, order_items, checkout
│   └── review/         # reviews, ratings
├── shared/
│   ├── decorators/     # @CurrentUser(), @Roles(), @Public()
│   ├── filters/        # GlobalExceptionFilter
│   ├── guards/         # JwtAuthGuard, RolesGuard
│   ├── interceptors/   # ResponseTransformInterceptor
│   ├── pipes/          # ValidationPipe config
│   └── utils/          # helpers, constants
└── config/             # ConfigService, env validation
```

Each feature folder:
```
features/[feature-name]/
├── [feature].module.ts
├── [feature].controller.ts
├── [feature].service.ts
├── repositories/
│   └── [entity].repository.ts
├── dto/
│   ├── create-[entity].dto.ts
│   └── update-[entity].dto.ts
├── entities/
│   └── [entity].entity.ts
├── types/
│   └── [feature].types.ts
├── tests/
│   ├── [feature].controller.spec.ts
│   └── [feature].service.spec.ts
└── CONTEXT.md
```

---

## 2. Naming Conventions

| Target | Convention | Example |
|--------|-----------|---------|
| Feature folders | kebab-case | `user-profile`, `product` |
| Files | kebab-case | `create-user.dto.ts`, `user.entity.ts` |
| Classes | PascalCase | `UserService`, `CreateUserDto` |
| Methods / Functions | camelCase | `findById`, `createOrder` |
| Variables | camelCase | `userId`, `cartItems` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS`, `ORDER_STATUS` |
| Interfaces / Types | PascalCase + prefix/suffix | `IUserPayload`, `OrderStatusType` |
| Entities | PascalCase singular | `User`, `Product`, `ProductVariant` |

---

## 3. Feature Rules

### Boundaries

| Feature | Owns |
|---------|------|
| `auth` | roles, users, JWT, authentication |
| `user-profile` | addresses |
| `product` | categories, products, product_variants, product_images |
| `cart` | carts, cart_items (refs product_variants) |
| `order` | orders, order_items, checkout (snapshots from product_variants) |
| `review` | reviews (links users, products, orders) |

### Cross-feature Communication

✅ **DO** — communicate via NestJS DI (module exports/imports):
```typescript
// product.module.ts
@Module({
  providers: [ProductService],
  exports: [ProductService],  // expose to other modules
})

// cart.module.ts
@Module({
  imports: [ProductModule],   // consume via DI
})
```

✅ **DO** — use EventEmitter for async side effects:
```typescript
// order.service.ts
this.eventEmitter.emit('order.created', { orderId, userId });

// review.listener.ts
@OnEvent('order.created')
handleOrderCreated(payload: OrderCreatedEvent) { ... }
```

❌ **DON'T** — import directly from another feature's internals:
```typescript
// cart.service.ts
import { ProductRepository } from '../product/repositories/product.repository'; // ❌
import { ProductService } from '../product/product.service';                     // ✅ via module export
```

---

## 4. Code Patterns

### Controllers — HTTP only, no business logic

```typescript
// ✅ DO
@Post()
@UseGuards(JwtAuthGuard)
async create(@CurrentUser() user: IUserPayload, @Body() dto: CreateOrderDto) {
  const order = await this.orderService.create(user.id, dto);
  return { data: order, message: 'Order created successfully' };
}

// ❌ DON'T — business logic in controller
@Post()
async create(@Body() dto: CreateOrderDto) {
  const variant = await this.variantRepo.findOne(dto.variantId);
  if (variant.stock < dto.quantity) throw new BadRequestException(...);
  // ...
}
```

### Services — Business logic only, delegate queries to repositories

```typescript
// ✅ DO
async checkout(userId: number, dto: CheckoutDto): Promise<Order> {
  const variant = await this.productVariantRepository.findByIdOrFail(dto.variantId);
  if (variant.stockQuantity < dto.quantity) {
    throw new BadRequestException('Insufficient stock');
  }
  return this.orderRepository.createWithItems(userId, dto, variant);
}

// ❌ DON'T — raw query in service
async checkout(userId: number, dto: CheckoutDto) {
  const variant = await this.dataSource.query(`SELECT * FROM product_variants WHERE id = ?`, [dto.variantId]);
}
```

### Repositories — All queries live here

```typescript
// ✅ DO — use QueryBuilder for complex queries
async findOrdersWithItems(userId: number): Promise<Order[]> {
  return this.createQueryBuilder('order')
    .leftJoinAndSelect('order.orderItems', 'item')
    .where('order.userId = :userId', { userId })
    .orderBy('order.createdAt', 'DESC')
    .getMany();
}
```

### Error Handling

```typescript
// ✅ DO — use NestJS built-in exceptions
throw new NotFoundException(`Product #${id} not found`);
throw new BadRequestException('Insufficient stock');
throw new UnauthorizedException('Token revoked');

// Custom exception (extends HttpException)
export class InsufficientStockException extends HttpException {
  constructor(sku: string) {
    super(`Insufficient stock for SKU: ${sku}`, HttpStatus.CONFLICT);
  }
}
```

Global exception filter in `shared/filters/global-exception.filter.ts`.

### Validation — class-validator in DTOs

```typescript
export class CreateOrderDto {
  @IsInt()
  @Min(1)
  variantId: number;

  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
```

Enable globally in `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
```

### Response Format

```typescript
// Success
{ data: Order, message: 'Order placed' }

// Paginated
{ data: Product[], meta: { page: 1, limit: 20, total: 120, totalPages: 6 } }

// Error (auto from global filter)
{ statusCode: 404, message: 'Product not found', error: 'Not Found' }
```

### Logging — service level only

```typescript
// ✅ DO
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  async create(userId: number, dto: CreateOrderDto) {
    this.logger.log(`Creating order - userId: ${userId}`);
    // ...
  }
}

// ❌ DON'T — log in controller
```

### Transactions — use QueryRunner for multi-step writes

```typescript
// order.service.ts — checkout flow
async placeOrder(userId: number, dto: CheckoutDto): Promise<Order> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const order = await queryRunner.manager.save(Order, { ... });
    await queryRunner.manager.save(OrderItem, items);
    await queryRunner.manager.decrement(ProductVariant, { id: dto.variantId }, 'stockQuantity', dto.quantity);
    await queryRunner.commitTransaction();
    return order;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

### NestJS Decorators

```typescript
// Custom decorators in shared/decorators/
@CurrentUser()   // extract JWT payload from request
@Roles('admin')  // role-based access
@Public()        // skip JwtAuthGuard

// Usage
@Get('profile')
@Roles('admin')
getProfile(@CurrentUser() user: IUserPayload) { ... }
```

---

## 5. Anti-patterns — MUST NOT Do

| ❌ Anti-pattern | ✅ Correct approach |
|----------------|-------------------|
| Import another feature's internal file | Use module exports + NestJS DI |
| Business logic in controllers | Move to service layer |
| Raw SQL / queries in services | Delegate to repository |
| Hardcoded config values | Use `ConfigService` |
| Store plain-text passwords | Hash with `bcrypt` |
| Reference `products` in cart/order | Always use `product_variants` |
| FK to `addresses` in orders | Snapshot to JSON field |
| Circular feature dependencies | Refactor to shared service |

---

## 6. Git Workflow

**Branch naming:** `[type]/[feature]-[short-description]`
```
feature/auth-jwt-refresh
fix/cart-guest-merge
refactor/order-checkout-flow
```

**Commit messages:** `[type]: [description]`
```
feat: add guest cart merge on login
fix: correct stock validation in checkout
refactor: extract payment logic to service
```

**PR requirements:**
- Linked to issue/task
- All tests pass, no TypeScript errors
- Reviewed by at least 1 team member

---

## 7. Testing

- Test files live in `tests/` inside each feature folder
- Naming: `[name].spec.ts`
- Structure: `describe → it` following **Arrange-Act-Assert**

```typescript
describe('OrderService', () => {
  it('should throw BadRequestException when stock is insufficient', async () => {
    // Arrange
    mockVariantRepo.findByIdOrFail.mockResolvedValue({ stockQuantity: 0 });
    // Act & Assert
    await expect(service.checkout(1, dto)).rejects.toThrow(BadRequestException);
  });
});
```

**Coverage targets:**

| Layer | Minimum |
|-------|---------|
| Services | 80% |
| Controllers | 70% |
| Repositories | 60% |

- Mock all external dependencies (DB, external APIs) — never hit real DB in unit tests
