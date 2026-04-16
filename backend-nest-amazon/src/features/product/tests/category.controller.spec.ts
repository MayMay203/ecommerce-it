import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../controllers/category.controller';
import type { Category } from '../entities/category.entity';
import { CategoryService } from '../services/category.service';

const mockCategoryService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return all categories with success message', async () => {
      // Arrange
      const categories = [categoryStub(), categoryStub({ id: 2, name: 'Clothing', slug: 'clothing' })];
      mockCategoryService.findAll.mockResolvedValue(categories);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockCategoryService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        data: categories,
        message: 'Categories retrieved successfully',
      });
    });

    it('should return empty data array when no categories exist', async () => {
      mockCategoryService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual({
        data: [],
        message: 'Categories retrieved successfully',
      });
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return a single category with success message', async () => {
      // Arrange
      const category = categoryStub();
      mockCategoryService.findOne.mockResolvedValue(category);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(mockCategoryService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        data: category,
        message: 'Category retrieved successfully',
      });
    });

    it('should propagate NotFoundException from service', async () => {
      mockCategoryService.findOne.mockRejectedValue(
        new NotFoundException('Category #99 not found'),
      );

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should create and return category with success message', async () => {
      // Arrange
      const dto = { name: 'Books', slug: 'books' };
      const created = categoryStub({ id: 3, name: 'Books', slug: 'books' });
      mockCategoryService.create.mockResolvedValue(created);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        data: created,
        message: 'Category created successfully',
      });
    });

    it('should propagate ConflictException from service', async () => {
      const dto = { name: 'Electronics', slug: 'electronics' };
      mockCategoryService.create.mockRejectedValue(
        new ConflictException('Category name "Electronics" already exists'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update and return category with success message', async () => {
      // Arrange
      const dto = { name: 'Consumer Electronics' };
      const updated = categoryStub({ name: 'Consumer Electronics' });
      mockCategoryService.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update(1, dto);

      // Assert
      expect(mockCategoryService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({
        data: updated,
        message: 'Category updated successfully',
      });
    });

    it('should propagate NotFoundException from service', async () => {
      mockCategoryService.update.mockRejectedValue(
        new NotFoundException('Category #99 not found'),
      );

      await expect(controller.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate BadRequestException when self-parent is set', async () => {
      mockCategoryService.update.mockRejectedValue(
        new BadRequestException('A category cannot be its own parent'),
      );

      await expect(controller.update(1, { parentId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should delete category and return void', async () => {
      // Arrange
      mockCategoryService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(mockCategoryService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException from service', async () => {
      mockCategoryService.remove.mockRejectedValue(
        new NotFoundException('Category #99 not found'),
      );

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('should propagate BadRequestException when category has children', async () => {
      mockCategoryService.remove.mockRejectedValue(
        new BadRequestException(
          'Cannot delete a category that has sub-categories',
        ),
      );

      await expect(controller.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
