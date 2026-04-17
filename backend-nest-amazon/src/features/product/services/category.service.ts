import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating category: ${dto.name}`);

    const [existingName, existingSlug] = await Promise.all([
      this.categoryRepository.findByName(dto.name),
      this.categoryRepository.findBySlug(dto.slug),
    ]);

    if (existingName) {
      throw new ConflictException(`Category name "${dto.name}" already exists`);
    }
    if (existingSlug) {
      throw new ConflictException(`Category slug "${dto.slug}" already exists`);
    }

    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category #${dto.parentId} not found`);
      }
    }

    return this.categoryRepository.create({
      name: dto.name,
      slug: dto.slug,
      parentId: dto.parentId ?? null,
    });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    this.logger.log(`Updating category #${id}`);

    await this.findOne(id);

    if (dto.name) {
      const existing = await this.categoryRepository.findByName(dto.name);
      if (existing && Number(existing.id) !== id) {
        throw new ConflictException(`Category name "${dto.name}" already exists`);
      }
    }

    if (dto.slug) {
      const existing = await this.categoryRepository.findBySlug(dto.slug);
      if (existing && Number(existing.id) !== id) {
        throw new ConflictException(`Category slug "${dto.slug}" already exists`);
      }
    }

    if (dto.parentId) {
      if (Number(dto.parentId) === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category #${dto.parentId} not found`);
      }
    }

    const updated = await this.categoryRepository.update(id, dto);
    return updated!;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting category #${id}`);

    await this.findOne(id);

    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete a category that has sub-categories',
      );
    }

    await this.categoryRepository.delete(id);
  }
}
