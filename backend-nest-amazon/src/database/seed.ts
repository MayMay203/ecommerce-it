import { AppDataSource } from './data-source';

async function main() {
  const entity = process.argv[2];
  const count = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;

  if (!entity) {
    console.error('Usage: npm run seed -- <entity> [count]');
    process.exit(1);
  }

  await AppDataSource.initialize();
  console.log(`🌱 Seeding: ${entity}${count ? ` (${count})` : ''}`);

  try {
    const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require(`./seeds/${entity}.seed`) as Record<string, unknown>;
    const seederFn = module[`seed${entityName}`];

    if (typeof seederFn !== 'function') {
      throw new Error(`No seeder function "seed${entityName}" found in ${entity}.seed.ts`);
    }

    await seederFn(AppDataSource, count);
    console.log('✅ Done');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
