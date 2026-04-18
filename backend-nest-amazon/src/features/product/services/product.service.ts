import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly productRepository: ProductRepository) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating product: ${dto.name}`);

    const existingSlug = await this.productRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new ConflictException(`Product slug "${dto.slug}" already exists`);
    }

    const existingName = await this.productRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictException(`Product name "${dto.name}" already exists`);
    }

    return this.productRepository.create({
      categoryId: dto.categoryId ?? null,
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    this.logger.log(`Updating product #${id}`);

    await this.findOne(id);

    if (dto.slug) {
      const conflict = await this.productRepository.findBySlugExcluding(dto.slug, id);
      if (conflict) {
        throw new ConflictException(`Product slug "${dto.slug}" already exists`);
      }
    }

    if (dto.name) {
      const conflict = await this.productRepository.findByNameExcluding(dto.name, id);
      if (conflict) {
        throw new ConflictException(`Product name "${dto.name}" already exists`);
      }
    }

    const updated = await this.productRepository.update(id, dto);
    return updated!;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Soft-deleting product #${id}`);
    await this.findOne(id);
    await this.productRepository.softDelete(id);
  }
}
