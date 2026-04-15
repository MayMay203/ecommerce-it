# Faker Examples

## User

```typescript
{
  email: faker.internet.email(),
  password_hash: await hash('password123', 10),
  full_name: faker.person.fullName(),
  phone: faker.phone.number(),
  is_active: true,
}
```

## Product

```typescript
{
  name: faker.commerce.productName(),
  slug: faker.helpers.slugify(name).toLowerCase(),
  description: faker.commerce.productDescription(),
  thumbnail_url: faker.image.url(),
  is_active: true,
}
```

## ProductVariant

```typescript
{
  sku: faker.string.alphanumeric(8).toUpperCase(),
  color: faker.color.human(),
  size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
  price: faker.number.int({ min: 50000, max: 5000000 }),
  stock_quantity: faker.number.int({ min: 0, max: 100 }),
}
```

## Address (Vietnam)

```typescript
{
  full_name: faker.person.fullName(),
  phone: faker.phone.number(),
  address_line: faker.location.streetAddress(),
  city: faker.helpers.arrayElement(['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ']),
  is_default: false,
}
```

## Order

```typescript
{
  status: faker.helpers.arrayElement(['pending', 'confirmed', 'shipping', 'delivered']),
  payment_method: faker.helpers.arrayElement(['cod', 'bank_transfer', 'momo']),
  payment_status: faker.helpers.arrayElement(['unpaid', 'paid']),
  shipping_fee: faker.helpers.arrayElement([0, 20000, 30000]),
}
```

## Fixed Accounts

```typescript
// Admin
{ email: 'admin@example.com', password: 'admin123', role: 'admin' }

// Test user  
{ email: 'user@example.com', password: 'user123', role: 'customer' }
```
