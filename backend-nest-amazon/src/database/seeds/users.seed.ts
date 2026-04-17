import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Role } from '../../features/auth/entities/role.entity';
import { User } from '../../features/auth/entities/user.entity';

const SALT_ROUNDS = 10;

interface UserDef {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  roleName: string;
  isActive: boolean;
}

const USERS: UserDef[] = [
  // ── Admins ──────────────────────────────────────────────────────────────────
  {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+84 900 000 001',
    roleName: 'admin',
    isActive: true,
  },
  {
    email: 'moderator@example.com',
    password: 'mod123456',
    firstName: 'Site',
    lastName: 'Moderator',
    phone: null,
    roleName: 'moderator',
    isActive: true,
  },

  // ── Customers ────────────────────────────────────────────────────────────────
  {
    email: 'alice@example.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Nguyen',
    phone: '+84 901 111 111',
    roleName: 'customer',
    isActive: true,
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'Tran',
    phone: '+84 902 222 222',
    roleName: 'customer',
    isActive: true,
  },
  {
    email: 'carol@example.com',
    password: 'password123',
    firstName: 'Carol',
    lastName: 'Le',
    phone: null,
    roleName: 'customer',
    isActive: true,
  },
  {
    email: 'inactive@example.com',
    password: 'password123',
    firstName: 'Inactive',
    lastName: 'User',
    phone: null,
    roleName: 'customer',
    isActive: false,
  },
];

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  // Build role name → id map
  const roles = await roleRepo.find();
  if (roles.length === 0) {
    console.warn('⚠  No roles found — run seed roles first');
    return;
  }
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  let created = 0;
  let skipped = 0;

  for (const def of USERS) {
    const exists = await userRepo.findOneBy({ email: def.email });
    if (exists) {
      skipped++;
      continue;
    }

    const roleId = roleMap.get(def.roleName);
    if (!roleId) {
      console.warn(`⚠  Role "${def.roleName}" not found — skipping ${def.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(def.password, SALT_ROUNDS);

    await userRepo.save(
      userRepo.create({
        email: def.email,
        password: passwordHash,
        firstName: def.firstName,
        lastName: def.lastName,
        phone: def.phone,
        isActive: def.isActive,
        roleId,
      }),
    );

    created++;
  }

  console.log(`✓ Seeded users: ${created} created, ${skipped} skipped`);
  console.log('  Accounts:');
  for (const u of USERS) {
    const icon = u.roleName === 'admin' ? '👑' : u.roleName === 'moderator' ? '🛡' : '👤';
    console.log(`  ${icon}  ${u.email}  /  ${u.password}  (${u.roleName}${u.isActive ? '' : ', inactive'})`);
  }
}
