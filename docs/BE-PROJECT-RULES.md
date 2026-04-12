# BE-PROJECT-RULES.md

## Tech Stack
- **Language:** TypeScript
- **Framework:** NestJS v11
- **ORM:** TypeORM

---

## 1. Feature Structure

Each feature maps to a **NestJS Module**. Every file lives inside its feature folder.

```
src/
├── features/
│   └── [feature-name]/
│       ├── [feature].module.ts
│       ├── [feature].controller.ts
│       ├── [feature].service.ts
│       ├── [feature].repository.ts
│       ├── dto/
│       │   ├── create-[feature].dto.ts
│       │   └── update-[feature].dto.ts
│       ├── entities/
│       │   └── [feature].entity.ts
│       ├── types/
│       │   └── [feature].types.ts
│       ├── utils/
│       ├── tests/
│       │   ├── [feature].service.spec.ts
│       │   └── [feature].controller.spec.ts
│       └── context.md
├── shared/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── types/
└── core/
    ├── database/
    └── config/
```

---

## 2. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Feature folders | `kebab-case` | `product-variants/` |
| Files | `kebab-case.[type].ts` | `orders.service.ts` |
| Classes | `PascalCase` | `OrdersService` |
| Methods / variables | `camelCase` | `findOrderById` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_CART_ITEMS` |
| Interfaces | `PascalCase` prefixed `I` (optional) | `OrderPayload` |
| Enums | `PascalCase` | `OrderStatus` |
| DTOs | `PascalCase` + suffix | `CreateOrderDto` |

---

## 3. Feature Rules

- Each feature **must export only its Module** — never export services/repositories directly to other features
- Cross-feature dependency → import the **Module**, inject the **Service** via DI
- No direct file-path imports into another feature's internals

**DO:**
```typescript
// orders.module.ts
@Module({
  imports: [UsersModule],   // import the module
  ...
})

// orders.service.ts
constructor(private readonly usersService: UsersService) {}
```

**DON'T:**
```typescript
// orders.service.ts
import { UsersRepository } from '../users/users.repository'; // ❌ internal import
```

- Shared utilities → `src/shared/`
- Infrastructure (DB, config, logger) → `src/core/`

---

## 4. Code Patterns (MUST follow)

### Error Handling
Use NestJS built-in HTTP exceptions. Never throw raw `Error`.

```typescript
// DO
throw new NotFoundException(`Product ${id} not found`);
throw new BadRequestException('Insufficient stock');

// DON'T
throw new Error('not found'); // ❌
```

### Validation
Use `class-validator` + `class-transformer` on all DTOs. `ValidationPipe` is applied globally.

```typescript
export class CreateOrderDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
}
```

### Response Format
All endpoints return a consistent envelope via a global `TransformInterceptor`:

```typescript
// Success
{ "success": true, "data": { ... }, "meta": { "page": 1, "total": 50 } }

// Error (handled by GlobalExceptionFilter)
{ "success": false, "error": { "code": "ORDER_001", "message": "...", "details": [] } }
```

### Repository Pattern
All DB queries live in `*.repository.ts`. Services never call `EntityManager` or `DataSource` directly.

```typescript
// DO — in orders.service.ts
const order = await this.ordersRepository.findById(id);

// DON'T — in orders.service.ts
const order = await this.dataSource.query('SELECT * FROM orders WHERE id = ?', [id]); // ❌
```

### Logging
Use NestJS `Logger`. Instantiate per class. Log at service level, not controller.

```typescript
private readonly logger = new Logger(OrdersService.name);
this.logger.log(`Order ${id} confirmed`);
this.logger.error(`Payment failed for order ${id}`, error.stack);
```

---

## 5. Anti-patterns (MUST NOT do)

| Anti-pattern | Why |
|-------------|-----|
| Import from another feature's internal file | Breaks encapsulation, creates hidden coupling |
| Business logic in controllers | Controllers = routing + validation + response only |
| DB queries in services | Violates repository pattern; hard to test/swap |
| Circular module imports | NestJS will fail at runtime |
| Hardcoded config values | Use `ConfigService` — values differ per environment |
| `any` type | Defeats TypeScript; use proper types or `unknown` |

---

## 6. NestJS-Specific Patterns

### Module structure
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],   // only export what other modules need
})
export class OrdersModule {}
```

### Auth Guards
```typescript
@UseGuards(JwtAuthGuard)          // require login
@UseGuards(JwtAuthGuard, RolesGuard)  // require login + role
@Roles('admin')
```

### Current User
```typescript
@Get('me/orders')
@UseGuards(JwtAuthGuard)
findMyOrders(@CurrentUser() user: JwtPayload) { ... }
```

### Config (no hardcoding)
```typescript
// DO
constructor(private config: ConfigService) {}
const secret = this.config.get<string>('JWT_SECRET');

// DON'T
const secret = 'my-secret-key'; // ❌
```

---

## 7. Git Workflow

- **Branch naming:** `<type>/<ticket-or-description>`
  - `feat/orders-checkout`, `fix/cart-merge-on-login`, `chore/update-deps`
- **Commit message:** Conventional Commits
  - `feat(orders): add checkout endpoint`
  - `fix(cart): merge guest cart on login`
  - `refactor(products): extract variant pricing logic`
- **PR requirements:**
  - Linked to a task/ticket
  - At least 1 reviewer approval
  - All tests pass
  - No `console.log` left in code

---

## 8. Testing

- Test files co-located inside `tests/` within each feature folder
- **Naming:** `[feature].[layer].spec.ts` — e.g., `orders.service.spec.ts`
- **Unit tests:** service + repository (mock dependencies with `jest.fn()`)
- **E2E tests:** `test/` at project root, use `supertest` against real DB (test schema)

```typescript
describe('OrdersService', () => {
  describe('createOrder', () => {
    it('should throw NotFoundException when product variant not found', async () => { ... });
    it('should decrement stock_quantity after successful order', async () => { ... });
  });
});
```

- **Coverage targets:** Services ≥ 80%, Controllers ≥ 60%
- Run: `npm run test` (unit) | `npm run test:e2e` (e2e)
