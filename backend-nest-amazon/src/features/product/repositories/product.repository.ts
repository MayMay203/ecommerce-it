import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.repo.find({
      relations: ['category', 'variants', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<Product | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['category', 'variants', 'images'],
    });
  }

  findBySlug(slug: string): Promise<Product | null> {
    return this.repo.findOne({
      where: { slug },
      relations: ['category', 'variants', 'images'],
    });
  }

  findByName(name: string): Promise<Product | null> {
    return this.repo.findOneBy({ name });
  }

  create(data: Partial<Product>): Promise<Product> {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.update(id, { isActive: false });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
