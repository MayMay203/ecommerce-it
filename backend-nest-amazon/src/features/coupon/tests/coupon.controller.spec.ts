import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Coupon } from '../entities/coupon.entity';
import { CouponController } from '../coupon.controller';
import { CouponService } from '../coupon.service';

const mockCouponService = {
  validate: jest.fn(),
  apply: jest.fn(),
};

const couponStub = (overrides: Partial<Coupon> = {}): Coupon =>
  ({
    id: 1,
    code: 'SAVE10',
    type: 'percent',
    value: 10,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as Coupon);

describe('CouponController', () => {
  let controller: CouponController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [{ provide: CouponService, useValue: mockCouponService }],
    }).compile();

    controller = module.get<CouponController>(CouponController);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should call service.validate(code) and return coupon data with success message', async () => {
      const coupon = couponStub();
      mockCouponService.validate.mockResolvedValue(coupon);

      const result = await controller.validate({ code: 'SAVE10' });

      expect(mockCouponService.validate).toHaveBeenCalledWith('SAVE10');
      expect(result.data).toMatchObject({
        id: coupon.id,
        code: 'SAVE10',
        type: 'percent',
        value: 10,
        expiresAt: coupon.expiresAt,
      });
      expect(result.message).toBe('Coupon is valid');
    });

    it('should propagate NotFoundException from service', async () => {
      mockCouponService.validate.mockRejectedValue(
        new NotFoundException({ code: 'COUPON_001', message: 'Coupon not found' }),
      );

      await expect(controller.validate({ code: 'INVALID' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('apply', () => {
    it('should call service.apply(code, subtotal) and return result with success message', async () => {
      const applyResult = {
        couponCode: 'SAVE10',
        discount: 10000,
        finalAmount: 90000,
        type: 'percent',
        value: 10,
      };
      mockCouponService.apply.mockResolvedValue(applyResult);

      const result = await controller.apply({ code: 'SAVE10', subtotal: 100000 });

      expect(mockCouponService.apply).toHaveBeenCalledWith('SAVE10', 100000);
      expect(result.data).toEqual(applyResult);
      expect(result.message).toBe('Coupon applied successfully');
    });

    it('should propagate BadRequestException from service', async () => {
      mockCouponService.apply.mockRejectedValue(
        new BadRequestException({ code: 'COUPON_002', message: 'Coupon has expired' }),
      );

      await expect(controller.apply({ code: 'EXPIRED', subtotal: 100000 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
