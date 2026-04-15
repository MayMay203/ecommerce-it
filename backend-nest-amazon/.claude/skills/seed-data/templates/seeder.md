# Seeder Template

## File Structure

```
src/database/
├── seeds/
│   ├── index.ts
│   └── {entity}.seed.ts
└── seed.ts
```

## Seeder File

```typescript
// src/database/seeds/{entity}.seed.ts
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { seed{Dependency} } from './{dependency}.seed';

export async function seed{Entity}(dataSource: DataSource, count = 10) {
  // 1. Seed dependencies
  await seed{Dependency}(dataSource);
  
  // 2. Skip if seeded
  const repo = dataSource.getRepository('{entity}');
  if (await repo.count() >= count) {
    console.log('⏭ {Entity} already seeded');
    return;
  }
  
  // 3. Get FK refs
  // const parentRepo = dataSource.getRepository('{parent}');
  
  // 4. Create & save
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({ /* faker data */ });
  }
  await repo.save(items);
  console.log(`✓ Seeded ${count} {entity}`);
}
```

## Runner

```typescript
// src/database/seed.ts
import { AppDataSource } from './data-source';

async function main() {
  const entity = process.argv[2];
  const count = parseInt(process.argv[3]) || undefined;
  
  await AppDataSource.initialize();
  const { [`seed${entity.charAt(0).toUpperCase() + entity.slice(1)}`]: seeder } = 
    await import(`./seeds/${entity}.seed`);
  await seeder(AppDataSource, count);
  await AppDataSource.destroy();
}

main().catch(console.error);
```

## package.json

```json
{
  "scripts": {
    "seed": "ts-node src/database/seed.ts"
  }
}
```
