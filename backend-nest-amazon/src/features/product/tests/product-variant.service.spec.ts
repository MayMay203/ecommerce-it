import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantRepository } from '../repositories/product-variant.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ProductVariantService } from '../services/product-variant.service';

const mockVariantRepository = {
  findByProductId: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockProductRepository = {
  findById: jest.fn(),
};

const variantStub = (overrides: Partial<ProductVariant> = {}): ProductVariant =>
  ({
    id: 1,
    productId: 1,
    product: null as any,
    sku: 'SKU-001',
    color: 'Red',
    size: 'M',
    price: 250000,
    salePrice: null,
    stockQuantity: 10,
    ...overrides,
  }) as ProductVariant;

const productStub = () => ({ id: 1, name: 'Test Product' });

describe('ProductVariantService', () => {
  let service: ProductVariantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantService,
        { provide: ProductVariantRepository, useValue: mockVariantRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<ProductVariantService>(ProductVariantService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findByProduct', () => {
    it('should return variants for existing product', async () => {
      const variants = [variantStub()];
      mockProductRepository.findById.mockResolvedValue(productStub());
      mockVariantRepository.findByProductId.mockResolvedValue(variants);

      const result = await service.findByProduct(1);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockVariantRepository.findByProductId).toHaveBeenCalledWith(1);
      expect(result).toEqual(variants);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.findByProduct(99)).rejects.toThrow(NotFoundException);
      expect(mockVariantRepository.findByProductId).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return variant when found', async () => {
      const variant = variantStub();
      mockVariantRepository.findById.mockResolvedValue(variant);

      const result = await service.findOne(1);

      expect(mockVariantRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(variant);
    });

    it('should throw NotFoundException when variant does not exist', async () => {
      mockVariantRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Variant #99 not found');
    });
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should create and return a new variant', async () => {
      const dto = { sku: 'SKU-002', price: 300000 };
      const created = variantStub({ id: 2, sku: 'SKU-002', price: 300000 });
      mockProductRepository.findById.mockResolvedValue(productStub());
      mockVariantRepository.findBySku.mockResolvedValue(null);
      mockVariantRepository.create.mockResolvedValue(created);

      const result = await service.create(1, dto);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockVariantRepository.findBySku).toHaveBeenCalledWith('SKU-002');
      expect(mockVariantRepository.create).toHaveBeenCalledWith({
        productId: 1,
        sku: 'SKU-002',
        color: null,
        size: null,
        price: 300000,
        salePrice: null,
        stockQuantity: 0,
      });
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.create(99, { sku: 'X', price: 1 })).rejects.toThrow(NotFoundException);
      expect(mockVariantRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when SKU already exists', async () => {
      mockProductRepository.findById.mockResolvedValue(productStub());
      mockVariantRepository.findBySku.mockResolvedValue(variantStub());

      await expect(service.create(1, { sku: 'SKU-001', price: 100 })).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(1, { sku: 'SKU-001', price: 100 })).rejects.toThrow(
        'SKU "SKU-001" already exists',
      );
      expect(mockVariantRepository.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update and return the variant', async () => {
      const dto = { price: 200000 };
      const existing = variantStub();
      const updated = variantStub({ price: 200000 });
      mockVariantRepository.findById.mockResolvedValue(existing);
      mockVariantRepository.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockVariantRepository.findById).toHaveBeenCalledWith(1);
      expect(mockVariantRepository.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when variant does not exist', async () => {
      mockVariantRepository.findById.mockResolvedValue(null);

      await expect(service.update(99, { price: 100 })).rejects.toThrow(NotFoundException);
      expect(mockVariantRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new SKU belongs to another variant', async () => {
      const dto = { sku: 'SKU-002' };
      mockVariantRepository.findById.mockResolvedValue(variantStub({ id: 1 }));
      mockVariantRepository.findBySku.mockResolvedValue(variantStub({ id: 2, sku: 'SKU-002' }));

      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
      expect(mockVariantRepository.update).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should delete variant successfully', async () => {
      mockVariantRepository.findById.mockResolvedValue(variantStub());
      mockVariantRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockVariantRepository.findById).toHaveBeenCalledWith(1);
      expect(mockVariantRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when variant does not exist', async () => {
      mockVariantRepository.findById.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockVariantRepository.delete).not.toHaveBeenCalled();
    });
  });
});
