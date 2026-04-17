import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImageController } from './controllers/product-image.controller';
import { ProductVariantController } from './controllers/product-variant.controller';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImageRepository } from './repositories/product-image.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { ProductImageService } from './services/product-image.service';
import { ProductVariantService } from './services/product-variant.service';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, ProductVariant, ProductImage]),
  ],
  controllers: [
    CategoryController,
    ProductController,
    ProductVariantController,
    ProductImageController,
  ],
  providers: [
    CategoryService,
    CategoryRepository,
    ProductService,
    ProductRepository,
    ProductVariantService,
    ProductVariantRepository,
    ProductImageService,
    ProductImageRepository,
  ],
  exports: [
    CategoryService,
    CategoryRepository,
    ProductService,
    ProductRepository,
    ProductVariantService,
    ProductVariantRepository,
  ],
})
export class ProductModule {}
