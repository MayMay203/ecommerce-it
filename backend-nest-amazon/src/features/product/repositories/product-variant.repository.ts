import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly repo: Repository<ProductVariant>,
  ) {}

  findByProductId(productId: number): Promise<ProductVariant[]> {
    return this.repo.find({
      where: { productId },
      order: { id: 'ASC' },
    });
  }

  findById(id: number): Promise<ProductVariant | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  findBySku(sku: string): Promise<ProductVariant | null> {
    return this.repo.findOneBy({ sku });
  }

  create(data: Partial<ProductVariant>): Promise<ProductVariant> {
    const variant = this.repo.create(data);
    return this.repo.save(variant);
  }

  async update(id: number, data: Partial<ProductVariant>): Promise<ProductVariant | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
