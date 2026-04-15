---
name: seed-data
description: >
  Generate fake/seed data for backend database.
  Use when user says "seed", "fake data", "generate data", "mock data",
  "tạo data test", "tạo dữ liệu mẫu", or wants sample data for testing.
argument-hint: "[entity-name] [count]"
allowed-tools:
  - Read
  - Write
  - Bash
---

# Seed Data Generator

## Usage

```
/seed-data users 20         → Seed 20 users (auto-seed roles first)
/seed-data products 50      → Seed products (auto-seed categories first)
```

## Workflow

1. **Read**: `DATABASE.md` + `package.json`

2. **Check prerequisites**:
   - `@faker-js/faker` in devDependencies?
   - `scripts.seed` exists?

3. **Resolve dependencies** from `./references/dependency-map.md`

4. **Show plan & confirm** (see `./templates/plan.md`)

5. **Execute after "yes"**:
   - Install missing deps
   - Update package.json if needed
   - Create seeders from `./templates/seeder.ts`
   - Run: `npm run seed -- {entity} {count}`

## Rules

- Check entity exists before creating seeder
- Auto-seed dependencies (recursive)
- Skip if already seeded (check count)
- Fixed accounts: admin@example.com / admin123
- Hash passwords always
