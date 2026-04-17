import { DataSource } from 'typeorm';
import { Category } from '../../features/product/entities/category.entity';
import { Product } from '../../features/product/entities/product.entity';
import { ProductImage } from '../../features/product/entities/product-image.entity';
import { ProductVariant } from '../../features/product/entities/product-variant.entity';

interface VariantDef {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
}

interface ImageDef {
  imageUrl: string;
  sortOrder: number;
}

interface ProductDef {
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  thumbnailUrl: string;
  variants: VariantDef[];
  images: ImageDef[];
}

const PRODUCTS: ProductDef[] = [
  // ── Electronics > Phones & Tablets ──────────────────────────────────────────
  {
    name: 'Samsung Galaxy S24',
    slug: 'samsung-galaxy-s24',
    categorySlug: 'phones-tablets',
    description:
      'Flagship Android smartphone with 6.2" Dynamic AMOLED display, 50MP camera system, and Snapdragon 8 Gen 3 processor.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Galaxy+S24',
    variants: [
      { sku: 'SGS24-BLK-128', color: 'Phantom Black', size: '128GB', price: 19990000, stockQuantity: 25 },
      { sku: 'SGS24-BLK-256', color: 'Phantom Black', size: '256GB', price: 22490000, stockQuantity: 20 },
      { sku: 'SGS24-VLT-128', color: 'Violet', size: '128GB', price: 19990000, stockQuantity: 15 },
      { sku: 'SGS24-CRM-256', color: 'Cream', size: '256GB', price: 22490000, salePrice: 20990000, stockQuantity: 10 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=S24+Front', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=S24+Back', sortOrder: 1 },
      { imageUrl: 'https://placehold.co/800x800?text=S24+Side', sortOrder: 2 },
    ],
  },
  {
    name: 'Apple iPhone 15',
    slug: 'apple-iphone-15',
    categorySlug: 'phones-tablets',
    description:
      'iPhone 15 features a 6.1" Super Retina XDR display, A16 Bionic chip, 48MP main camera, and Dynamic Island.',
    thumbnailUrl: 'https://placehold.co/400x400?text=iPhone+15',
    variants: [
      { sku: 'IP15-BLK-128', color: 'Black', size: '128GB', price: 22990000, stockQuantity: 30 },
      { sku: 'IP15-BLK-256', color: 'Black', size: '256GB', price: 25990000, stockQuantity: 20 },
      { sku: 'IP15-PNK-128', color: 'Pink', size: '128GB', price: 22990000, stockQuantity: 18 },
      { sku: 'IP15-YLW-256', color: 'Yellow', size: '256GB', price: 25990000, salePrice: 24490000, stockQuantity: 12 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=iPhone15+Front', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=iPhone15+Back', sortOrder: 1 },
    ],
  },

  // ── Electronics > Laptops & Computers ───────────────────────────────────────
  {
    name: 'MacBook Air M3',
    slug: 'macbook-air-m3',
    categorySlug: 'laptops-computers',
    description:
      'Incredibly thin and light laptop powered by Apple M3 chip, 13.6" Liquid Retina display, up to 18 hours battery life.',
    thumbnailUrl: 'https://placehold.co/400x400?text=MacBook+Air+M3',
    variants: [
      { sku: 'MBA-M3-8-256-MNT', color: 'Midnight', size: '8GB/256GB', price: 28990000, stockQuantity: 15 },
      { sku: 'MBA-M3-8-512-MNT', color: 'Midnight', size: '8GB/512GB', price: 34990000, stockQuantity: 10 },
      { sku: 'MBA-M3-16-512-SLV', color: 'Silver', size: '16GB/512GB', price: 39990000, salePrice: 37490000, stockQuantity: 8 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=MacBook+Air+Open', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=MacBook+Air+Closed', sortOrder: 1 },
    ],
  },
  {
    name: 'Dell XPS 15',
    slug: 'dell-xps-15',
    categorySlug: 'laptops-computers',
    description:
      "Premium 15.6\" OLED laptop with Intel Core i7-13700H, NVIDIA RTX 4060, and stunning InfinityEdge display.",
    thumbnailUrl: 'https://placehold.co/400x400?text=Dell+XPS+15',
    variants: [
      { sku: 'DXPS15-16-512', color: 'Platinum Silver', size: '16GB/512GB', price: 44990000, stockQuantity: 8 },
      { sku: 'DXPS15-32-1TB', color: 'Platinum Silver', size: '32GB/1TB', price: 54990000, salePrice: 51490000, stockQuantity: 5 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=XPS15+Open', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=XPS15+Side', sortOrder: 1 },
    ],
  },

  // ── Electronics > Audio & Headphones ────────────────────────────────────────
  {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    categorySlug: 'audio-headphones',
    description:
      'Industry-leading noise cancelling headphones with 30-hour battery, multipoint connection, and premium sound quality.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Sony+WH1000XM5',
    variants: [
      { sku: 'SWXM5-BLK', color: 'Black', price: 7990000, salePrice: 6990000, stockQuantity: 40 },
      { sku: 'SWXM5-SLV', color: 'Silver', price: 7990000, stockQuantity: 30 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=WH1000XM5+Front', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=WH1000XM5+Side', sortOrder: 1 },
    ],
  },

  // ── Clothing > Men's Fashion ─────────────────────────────────────────────────
  {
    name: "Men's Classic Polo Shirt",
    slug: 'mens-classic-polo-shirt',
    categorySlug: 'mens-fashion',
    description:
      'Premium cotton polo shirt with ribbed collar and cuffs. Comfortable fit for everyday wear.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Polo+Shirt',
    variants: [
      { sku: 'POLO-WHT-S', color: 'White', size: 'S', price: 350000, stockQuantity: 50 },
      { sku: 'POLO-WHT-M', color: 'White', size: 'M', price: 350000, stockQuantity: 60 },
      { sku: 'POLO-WHT-L', color: 'White', size: 'L', price: 350000, stockQuantity: 55 },
      { sku: 'POLO-WHT-XL', color: 'White', size: 'XL', price: 350000, stockQuantity: 40 },
      { sku: 'POLO-NVY-S', color: 'Navy', size: 'S', price: 350000, stockQuantity: 45 },
      { sku: 'POLO-NVY-M', color: 'Navy', size: 'M', price: 350000, stockQuantity: 55 },
      { sku: 'POLO-NVY-L', color: 'Navy', size: 'L', price: 350000, salePrice: 299000, stockQuantity: 48 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Polo+Front', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=Polo+Back', sortOrder: 1 },
    ],
  },
  {
    name: "Men's Slim Fit Chino Pants",
    slug: 'mens-slim-fit-chino-pants',
    categorySlug: 'mens-fashion',
    description:
      'Versatile slim-fit chino pants in stretch cotton blend. Perfect for office and casual occasions.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Chino+Pants',
    variants: [
      { sku: 'CHINO-KHK-29', color: 'Khaki', size: '29', price: 550000, stockQuantity: 30 },
      { sku: 'CHINO-KHK-31', color: 'Khaki', size: '31', price: 550000, stockQuantity: 35 },
      { sku: 'CHINO-KHK-33', color: 'Khaki', size: '33', price: 550000, stockQuantity: 28 },
      { sku: 'CHINO-NVY-31', color: 'Navy', size: '31', price: 550000, salePrice: 480000, stockQuantity: 25 },
      { sku: 'CHINO-NVY-33', color: 'Navy', size: '33', price: 550000, salePrice: 480000, stockQuantity: 20 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Chino+Front', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=Chino+Side', sortOrder: 1 },
    ],
  },

  // ── Clothing > Women's Fashion ───────────────────────────────────────────────
  {
    name: "Women's Floral Summer Dress",
    slug: 'womens-floral-summer-dress',
    categorySlug: 'womens-fashion',
    description:
      'Lightweight chiffon summer dress with floral print. Features adjustable straps and flowy silhouette.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Summer+Dress',
    variants: [
      { sku: 'FDRS-BLU-XS', color: 'Blue Floral', size: 'XS', price: 480000, stockQuantity: 20 },
      { sku: 'FDRS-BLU-S', color: 'Blue Floral', size: 'S', price: 480000, stockQuantity: 25 },
      { sku: 'FDRS-BLU-M', color: 'Blue Floral', size: 'M', price: 480000, stockQuantity: 30 },
      { sku: 'FDRS-PNK-S', color: 'Pink Floral', size: 'S', price: 480000, salePrice: 399000, stockQuantity: 18 },
      { sku: 'FDRS-PNK-M', color: 'Pink Floral', size: 'M', price: 480000, salePrice: 399000, stockQuantity: 22 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Dress+Front', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=Dress+Detail', sortOrder: 1 },
    ],
  },

  // ── Books > Technology & Science ────────────────────────────────────────────
  {
    name: 'Clean Code',
    slug: 'clean-code',
    categorySlug: 'technology-science',
    description:
      'A handbook of agile software craftsmanship by Robert C. Martin. Learn to write clean, maintainable code.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Clean+Code',
    variants: [
      { sku: 'BOOK-CC-PB', size: 'Paperback', price: 320000, stockQuantity: 100 },
      { sku: 'BOOK-CC-HB', size: 'Hardcover', price: 450000, stockQuantity: 40 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Clean+Code+Cover', sortOrder: 0 },
    ],
  },
  {
    name: 'The Pragmatic Programmer',
    slug: 'the-pragmatic-programmer',
    categorySlug: 'technology-science',
    description:
      '20th Anniversary Edition. Your Journey to Mastery. A must-read for every software developer.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Pragmatic+Programmer',
    variants: [
      { sku: 'BOOK-PP-PB', size: 'Paperback', price: 350000, stockQuantity: 80 },
      { sku: 'BOOK-PP-HB', size: 'Hardcover', price: 490000, salePrice: 420000, stockQuantity: 35 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Pragmatic+Cover', sortOrder: 0 },
    ],
  },

  // ── Sports & Outdoors > Exercise & Fitness ───────────────────────────────────
  {
    name: 'Resistance Band Set',
    slug: 'resistance-band-set',
    categorySlug: 'exercise-fitness',
    description:
      '5-level resistance band set for full-body workouts. Includes door anchor, handles, and ankle straps.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Resistance+Bands',
    variants: [
      { sku: 'RBAND-5PK', color: 'Multi', price: 280000, salePrice: 230000, stockQuantity: 150 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Bands+Set', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=Bands+Usage', sortOrder: 1 },
    ],
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    categorySlug: 'exercise-fitness',
    description:
      'Non-slip 6mm thick TPE yoga mat with alignment lines. Eco-friendly and sweat-resistant.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Yoga+Mat',
    variants: [
      { sku: 'YMAT-PPL', color: 'Purple', price: 350000, stockQuantity: 80 },
      { sku: 'YMAT-BLU', color: 'Blue', price: 350000, stockQuantity: 70 },
      { sku: 'YMAT-GRN', color: 'Green', price: 350000, salePrice: 299000, stockQuantity: 60 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Yoga+Mat+Top', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=Yoga+Mat+Rolled', sortOrder: 1 },
    ],
  },

  // ── Home & Garden > Kitchen & Dining ────────────────────────────────────────
  {
    name: 'Ceramic Non-Stick Pan Set',
    slug: 'ceramic-non-stick-pan-set',
    categorySlug: 'kitchen-dining',
    description:
      '3-piece ceramic coated cookware set: 20cm, 24cm, and 28cm frying pans. PFOA-free and dishwasher safe.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Pan+Set',
    variants: [
      { sku: 'PANSET-3PC-BLK', color: 'Black', price: 650000, salePrice: 549000, stockQuantity: 40 },
      { sku: 'PANSET-3PC-RED', color: 'Red', price: 650000, stockQuantity: 30 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Pan+Set+Top', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=Pan+Set+Stack', sortOrder: 1 },
    ],
  },

  // ── Beauty & Health > Skincare ───────────────────────────────────────────────
  {
    name: 'Vitamin C Brightening Serum',
    slug: 'vitamin-c-brightening-serum',
    categorySlug: 'skincare',
    description:
      '20% Vitamin C + E + Ferulic acid serum. Reduces dark spots, firms skin, and protects against UV damage.',
    thumbnailUrl: 'https://placehold.co/400x400?text=Vitamin+C+Serum',
    variants: [
      { sku: 'VCSER-30ML', size: '30ml', price: 450000, stockQuantity: 120 },
      { sku: 'VCSER-60ML', size: '60ml', price: 799000, salePrice: 699000, stockQuantity: 80 },
    ],
    images: [
      { imageUrl: 'https://placehold.co/800x800?text=Serum+Bottle', sortOrder: 0 },
      { imageUrl: 'https://placehold.co/800x800?text=Serum+Texture', sortOrder: 1 },
    ],
  },
];

export async function seedProducts(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const variantRepo = dataSource.getRepository(ProductVariant);
  const imageRepo = dataSource.getRepository(ProductImage);

  const existingCount = await productRepo.count();
  if (existingCount >= PRODUCTS.length) {
    console.log('⏭  Products already seeded');
    return;
  }

  let productsCreated = 0;
  let variantsCreated = 0;
  let imagesCreated = 0;

  for (const def of PRODUCTS) {
    const category = await categoryRepo.findOneBy({ slug: def.categorySlug });
    if (!category) {
      console.warn(`  ⚠ Category "${def.categorySlug}" not found — run seed categories first`);
      continue;
    }

    let product = await productRepo.findOneBy({ slug: def.slug });
    if (!product) {
      product = await productRepo.save(
        productRepo.create({
          categoryId: category.id,
          name: def.name,
          slug: def.slug,
          description: def.description,
          thumbnailUrl: def.thumbnailUrl,
          isActive: true,
        }),
      );
      productsCreated++;
    }

    for (const v of def.variants) {
      const exists = await variantRepo.findOneBy({ sku: v.sku });
      if (!exists) {
        await variantRepo.save(
          variantRepo.create({
            productId: product.id,
            sku: v.sku,
            color: v.color ?? null,
            size: v.size ?? null,
            price: v.price,
            salePrice: v.salePrice ?? null,
            stockQuantity: v.stockQuantity,
          }),
        );
        variantsCreated++;
      }
    }

    for (const img of def.images) {
      const existingImages = await imageRepo.findBy({ productId: product.id });
      const alreadyHasImage = existingImages.some((i) => i.imageUrl === img.imageUrl);
      if (!alreadyHasImage) {
        await imageRepo.save(
          imageRepo.create({
            productId: product.id,
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder,
          }),
        );
        imagesCreated++;
      }
    }
  }

  console.log(
    `✓ Seeded ${productsCreated} products, ${variantsCreated} variants, ${imagesCreated} images`,
  );
}
