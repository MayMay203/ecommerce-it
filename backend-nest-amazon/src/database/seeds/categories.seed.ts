import { DataSource } from 'typeorm';
import { Category } from '../../features/product/entities/category.entity';

interface CategoryDef {
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
}

const CATEGORIES: CategoryDef[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    children: [
      { name: 'Phones & Tablets', slug: 'phones-tablets' },
      { name: 'Laptops & Computers', slug: 'laptops-computers' },
      { name: 'Audio & Headphones', slug: 'audio-headphones' },
    ],
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    children: [
      { name: "Men's Fashion", slug: 'mens-fashion' },
      { name: "Women's Fashion", slug: 'womens-fashion' },
      { name: 'Kids & Baby', slug: 'kids-baby' },
    ],
  },
  {
    name: 'Books',
    slug: 'books',
    children: [
      { name: 'Fiction & Literature', slug: 'fiction-literature' },
      { name: 'Technology & Science', slug: 'technology-science' },
    ],
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    children: [
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining' },
    ],
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    children: [
      { name: 'Exercise & Fitness', slug: 'exercise-fitness' },
      { name: 'Outdoor Recreation', slug: 'outdoor-recreation' },
    ],
  },
  {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    children: [
      { name: 'Skincare', slug: 'skincare' },
      { name: 'Vitamins & Supplements', slug: 'vitamins-supplements' },
    ],
  },
];

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Category);

  const totalExpected =
    CATEGORIES.length +
    CATEGORIES.reduce((sum, c) => sum + (c.children?.length ?? 0), 0);

  const count = await repo.count();
  if (count >= totalExpected) {
    console.log('⏭  Categories already seeded');
    return;
  }

  let created = 0;

  for (const def of CATEGORIES) {
    // Upsert root category
    let root = await repo.findOneBy({ slug: def.slug });
    if (!root) {
      root = await repo.save(
        repo.create({ name: def.name, slug: def.slug, parentId: null }),
      );
      created++;
    }

    // Upsert children
    for (const child of def.children ?? []) {
      const exists = await repo.findOneBy({ slug: child.slug });
      if (!exists) {
        await repo.save(
          repo.create({ name: child.name, slug: child.slug, parentId: root.id }),
        );
        created++;
      }
    }
  }

  console.log(`✓ Seeded ${created} categories (${CATEGORIES.length} root + ${totalExpected - CATEGORIES.length} sub)`);
}
