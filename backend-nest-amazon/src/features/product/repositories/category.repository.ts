import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.repo.find({
      relations: ['children'],
      where: { parentId: IsNull() },
      order: { name: 'ASC' },
    });
  }

  findById(id: number): Promise<Category | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOneBy({ slug });
  }

  findByName(name: string): Promise<Category | null> {
    return this.repo.findOneBy({ name });
  }

  create(data: Partial<Category>): Promise<Category> {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }

  async update(id: number, data: Partial<Category>): Promise<Category | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  hasChildren(id: number): Promise<boolean> {
    return this.repo
      .createQueryBuilder('c')
      .where('c.parentId = :id', { id })
      .getCount()
      .then((count) => count > 0);
  }
}
