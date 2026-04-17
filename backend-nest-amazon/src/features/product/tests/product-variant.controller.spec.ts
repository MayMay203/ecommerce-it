import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantController } from '../controllers/product-variant.controller';
import type { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantService } from '../services/product-variant.service';

const mockVariantService = {
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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

describe('ProductVariantController', () => {
  let controller: ProductVariantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductVariantController],
      providers: [{ provide: ProductVariantService, useValue: mockVariantService }],
    }).compile();

    controller = module.get<ProductVariantController>(ProductVariantController);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return variant with success message', async () => {
      const variant = variantStub();
      mockVariantService.findOne.mockResolvedValue(variant);

      const result = await controller.findOne(1);

      expect(mockVariantService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ data: variant, message: 'Variant retrieved successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      mockVariantService.findOne.mockRejectedValue(new NotFoundException('Variant #99 not found'));

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update variant and return success message', async () => {
      const dto = { price: 200000 };
      const updated = variantStub({ price: 200000 });
      mockVariantService.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(mockVariantService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ data: updated, message: 'Variant updated successfully' });
    });

    it('should propagate NotFoundException from service', async () => {
      mockVariantService.update.mockRejectedValue(new NotFoundException('Variant #99 not found'));

      await expect(controller.update(99, {})).rejects.toThrow(NotFoundException);
    });

    it('should propagate ConflictException when SKU conflicts', async () => {
      mockVariantService.update.mockRejectedValue(
        new ConflictException('SKU "SKU-001" already exists'),
      );

      await expect(controller.update(1, { sku: 'SKU-001' })).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should delete variant and return void', async () => {
      mockVariantService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockVariantService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException from service', async () => {
      mockVariantService.remove.mockRejectedValue(new NotFoundException('Variant #99 not found'));

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
