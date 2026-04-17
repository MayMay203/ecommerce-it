import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../controllers/product.controller';
import type { Product } from '../entities/product.entity';
import { ProductImageService } from '../services/product-image.service';
import { ProductVariantService } from '../services/product-variant.service';
import { ProductService } from '../services/product.service';

const mockProductService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockVariantService = {
  findByProduct: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockImageService = {
  create: jest.fn(),
  remove: jest.fn(),
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

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: ProductVariantService, useValue: mockVariantService },
        { provide: ProductImageService, useValue: mockImageService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should return all products with success message', async () => {
      const products = [productStub()];
      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(mockProductService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: products, message: 'Products retrieved successfully' });
    });

    it('should return empty data when no products', async () => {
      mockProductService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual({ data: [], message: 'Products retrieved successfully' });
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return product by slug with success message', async () => {
      const product = productStub();
      mockProductService.findBySlug.mockResolvedValue(product);

      const result = await controller.findOne('test-product');

      expect(mockProductService.findBySlug).toHaveBeenCalledWith('test-product');
      expect(result).toEqual({ data: product, message: 'Product retrieved successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      mockProductService.findBySlug.mockRejectedValue(
        new NotFoundException('Product "no-such" not found'),
      );

      await expect(controller.findOne('no-such')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('findVariants', () => {
    it('should return variants for a product', async () => {
      const variants: never[] = [];
      mockVariantService.findByProduct.mockResolvedValue(variants);

      const result = await controller.findVariants(1);

      expect(mockVariantService.findByProduct).toHaveBeenCalledWith(1);
      expect(result).toEqual({ data: variants, message: 'Variants retrieved successfully' });
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should create product and return success message', async () => {
      const dto = { name: 'New Product', slug: 'new-product' };
      const created = productStub({ id: 2, name: 'New Product', slug: 'new-product' });
      mockProductService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(mockProductService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ data: created, message: 'Product created successfully' });
    });

    it('should propagate ConflictException from service', async () => {
      mockProductService.create.mockRejectedValue(
        new ConflictException('Product slug "test-product" already exists'),
      );

      await expect(controller.create({ name: 'X', slug: 'test-product' } as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update product and return success message', async () => {
      const dto = { name: 'Updated Product' };
      const updated = productStub({ name: 'Updated Product' });
      mockProductService.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(mockProductService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ data: updated, message: 'Product updated successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      mockProductService.update.mockRejectedValue(
        new NotFoundException('Product #99 not found'),
      );

      await expect(controller.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should soft-delete product and return void', async () => {
      mockProductService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockProductService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException from service', async () => {
      mockProductService.remove.mockRejectedValue(new NotFoundException('Product #99 not found'));

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('addVariant', () => {
    it('should add a variant and return success message', async () => {
      const dto = { sku: 'SKU-001', price: 100000 };
      const variant = { id: 1, sku: 'SKU-001', price: 100000, productId: 1 };
      mockVariantService.create.mockResolvedValue(variant);

      const result = await controller.addVariant(1, dto as any);

      expect(mockVariantService.create).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ data: variant, message: 'Variant created successfully' });
    });
  });

  // ---------------------------------------------------------------------------
  describe('addImage', () => {
    it('should add an image and return success message', async () => {
      const dto = { imageUrl: 'https://example.com/img.jpg' };
      const image = { id: 1, imageUrl: 'https://example.com/img.jpg', productId: 1, sortOrder: 0 };
      mockImageService.create.mockResolvedValue(image);

      const result = await controller.addImage(1, dto as any);

      expect(mockImageService.create).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ data: image, message: 'Image added successfully' });
    });
  });
});
