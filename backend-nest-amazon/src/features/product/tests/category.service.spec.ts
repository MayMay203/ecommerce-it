import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Category } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryService } from '../services/category.service';

const mockCategoryRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  hasChildren: jest.fn(),
};

const categoryStub = (overrides: Partial<Category> = {}): Category =>
  ({
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    parentId: null,
    parent: null,
    children: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as Category;

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useValue: mockCategoryRepository },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return all root categories', async () => {
      // Arrange
      const categories = [
        categoryStub(),
        categoryStub({ id: 2, name: 'Clothing', slug: 'clothing' }),
      ];
      mockCategoryRepository.findAll.mockResolvedValue(categories);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(categories);
    });

    it('should return an empty array when no categories exist', async () => {
      mockCategoryRepository.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return category when found', async () => {
      // Arrange
      const category = categoryStub();
      mockCategoryRepository.findById.mockResolvedValue(category);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'Category #99 not found',
      );
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should create and return a new category', async () => {
      // Arrange
      const dto = { name: 'Books', slug: 'books' };
      const created = categoryStub({ id: 3, name: 'Books', slug: 'books' });
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.findBySlug.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(created);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(mockCategoryRepository.findByName).toHaveBeenCalledWith('Books');
      expect(mockCategoryRepository.findBySlug).toHaveBeenCalledWith('books');
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: 'Books',
        slug: 'books',
        parentId: null,
      });
      expect(result).toEqual(created);
    });

    it('should create a child category when valid parentId is given', async () => {
      // Arrange
      const parent = categoryStub();
      const dto = { name: 'Phones', slug: 'phones', parentId: 1 };
      const created = categoryStub({ id: 4, name: 'Phones', slug: 'phones', parentId: 1 });
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.findBySlug.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(parent);
      mockCategoryRepository.create.mockResolvedValue(created);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when name already exists', async () => {
      // Arrange
      const dto = { name: 'Electronics', slug: 'electronics' };
      mockCategoryRepository.findByName.mockResolvedValue(categoryStub());
      mockCategoryRepository.findBySlug.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Category name "Electronics" already exists',
      );
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when slug already exists', async () => {
      // Arrange
      const dto = { name: 'New Category', slug: 'electronics' };
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.findBySlug.mockResolvedValue(categoryStub());

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Category slug "electronics" already exists',
      );
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when parentId does not exist', async () => {
      // Arrange
      const dto = { name: 'Phones', slug: 'phones', parentId: 99 };
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.findBySlug.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow(
        'Parent category #99 not found',
      );
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update and return the category', async () => {
      // Arrange
      const dto = { name: 'Consumer Electronics' };
      const existing = categoryStub();
      const updated = categoryStub({ name: 'Consumer Electronics' });
      mockCategoryRepository.findById.mockResolvedValue(existing);
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.update.mockResolvedValue(updated);

      // Act
      const result = await service.update(1, dto);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name belongs to another category', async () => {
      // Arrange
      const dto = { name: 'Clothing' };
      mockCategoryRepository.findById.mockResolvedValue(categoryStub({ id: 1 }));
      mockCategoryRepository.findByName.mockResolvedValue(
        categoryStub({ id: 2, name: 'Clothing' }),
      );

      // Act & Assert
      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
      await expect(service.update(1, dto)).rejects.toThrow(
        'Category name "Clothing" already exists',
      );
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when setting itself as parent', async () => {
      // Arrange
      const dto = { parentId: 1 };
      mockCategoryRepository.findById.mockResolvedValue(categoryStub({ id: 1 }));

      // Act & Assert
      await expect(service.update(1, dto)).rejects.toThrow(BadRequestException);
      await expect(service.update(1, dto)).rejects.toThrow(
        'A category cannot be its own parent',
      );
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when new parentId does not exist', async () => {
      // Arrange
      const dto = { parentId: 99 };
      mockCategoryRepository.findById
        .mockResolvedValueOnce(categoryStub({ id: 1 })) // findOne(id)
        .mockResolvedValueOnce(null); // findById(parentId)

      // Act & Assert
      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, dto)).rejects.toThrow(
        'Parent category #99 not found',
      );
    });

    it('should allow updating with same name (self-collision is no-op)', async () => {
      // Arrange
      const dto = { name: 'Electronics' };
      const category = categoryStub({ id: 1, name: 'Electronics' });
      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.findByName.mockResolvedValue(category); // same id → allowed
      mockCategoryRepository.update.mockResolvedValue(category);

      // Act
      const result = await service.update(1, dto);

      // Assert
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(category);
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should delete category successfully', async () => {
      // Arrange
      mockCategoryRepository.findById.mockResolvedValue(categoryStub());
      mockCategoryRepository.hasChildren.mockResolvedValue(false);
      mockCategoryRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(1);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.hasChildren).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when category has children', async () => {
      // Arrange
      mockCategoryRepository.findById.mockResolvedValue(categoryStub());
      mockCategoryRepository.hasChildren.mockResolvedValue(true);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
      await expect(service.remove(1)).rejects.toThrow(
        'Cannot delete a category that has sub-categories',
      );
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});
