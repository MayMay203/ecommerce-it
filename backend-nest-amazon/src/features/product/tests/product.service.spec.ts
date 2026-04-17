import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductService } from '../services/product.service';

const mockProductRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const productStub = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 1,
    categoryId: 1,
    category: null,
    name: 'Test Product',
    slug: 'test-product',
    description: null,
    thumbnailUrl: null,
    isActive: true,
    variants: [],
    images: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as Product;

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [productStub(), productStub({ id: 2, name: 'Another', slug: 'another' })];
      mockProductRepository.findAll.mockResolvedValue(products);

      const result = await service.findAll();

      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(products);
    });

    it('should return empty array when no products exist', async () => {
      mockProductRepository.findAll.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return product when found', async () => {
      const product = productStub();
      mockProductRepository.findById.mockResolvedValue(product);

      const result = await service.findOne(1);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Product #99 not found');
    });
  });

  // ---------------------------------------------------------------------------
  describe('findBySlug', () => {
    it('should return product when found by slug', async () => {
      const product = productStub();
      mockProductRepository.findBySlug.mockResolvedValue(product);

      const result = await service.findBySlug('test-product');

      expect(mockProductRepository.findBySlug).toHaveBeenCalledWith('test-product');
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when slug not found', async () => {
      mockProductRepository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('no-such')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should create and return a new product', async () => {
      const dto = { name: 'New Product', slug: 'new-product', categoryId: 1 };
      const created = productStub({ id: 2, name: 'New Product', slug: 'new-product' });
      mockProductRepository.findBySlug.mockResolvedValue(null);
      mockProductRepository.findByName.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockProductRepository.findBySlug).toHaveBeenCalledWith('new-product');
      expect(mockProductRepository.findByName).toHaveBeenCalledWith('New Product');
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        categoryId: 1,
        name: 'New Product',
        slug: 'new-product',
        description: null,
        thumbnailUrl: null,
        isActive: true,
      });
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const dto = { name: 'New Product', slug: 'test-product' };
      mockProductRepository.findBySlug.mockResolvedValue(productStub());
      mockProductRepository.findByName.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Product slug "test-product" already exists',
      );
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when name already exists', async () => {
      const dto = { name: 'Test Product', slug: 'new-slug' };
      mockProductRepository.findBySlug.mockResolvedValue(null);
      mockProductRepository.findByName.mockResolvedValue(productStub());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Product name "Test Product" already exists',
      );
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update and return the product', async () => {
      const dto = { name: 'Updated Product' };
      const existing = productStub();
      const updated = productStub({ name: 'Updated Product' });
      mockProductRepository.findById.mockResolvedValue(existing);
      mockProductRepository.findByName.mockResolvedValue(null);
      mockProductRepository.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new slug belongs to another product', async () => {
      const dto = { slug: 'another-slug' };
      mockProductRepository.findById.mockResolvedValue(productStub({ id: 1 }));
      mockProductRepository.findBySlug.mockResolvedValue(productStub({ id: 2, slug: 'another-slug' }));

      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating with same slug (self-collision is no-op)', async () => {
      const dto = { slug: 'test-product' };
      const product = productStub({ id: 1, slug: 'test-product' });
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.findBySlug.mockResolvedValue(product);
      mockProductRepository.update.mockResolvedValue(product);

      const result = await service.update(1, dto);

      expect(mockProductRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(product);
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should soft-delete product successfully', async () => {
      mockProductRepository.findById.mockResolvedValue(productStub());
      mockProductRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockProductRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
