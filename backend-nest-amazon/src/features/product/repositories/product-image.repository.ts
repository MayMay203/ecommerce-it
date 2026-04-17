import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from '../entities/product-image.entity';

@Injectable()
export class ProductImageRepository {
  constructor(
    @InjectRepository(ProductImage)
    private readonly repo: Repository<ProductImage>,
  ) {}

  findByProductId(productId: number): Promise<ProductImage[]> {
    return this.repo.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });
  }

  findById(id: number): Promise<ProductImage | null> {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<ProductImage>): Promise<ProductImage> {
    const image = this.repo.create(data);
    return this.repo.save(image);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
