import { DataSource } from 'typeorm';
import { Role } from '../../features/auth/entities/role.entity';

const ROLES = ['admin', 'customer', 'moderator'];

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Role);

  const count = await repo.count();
  if (count >= ROLES.length) {
    console.log('⏭ Roles already seeded');
    return;
  }

  for (const name of ROLES) {
    const exists = await repo.findOneBy({ name });
    if (!exists) {
      await repo.save(repo.create({ name }));
    }
  }

  console.log(`✓ Seeded ${ROLES.length} roles: ${ROLES.join(', ')}`);
}
