import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Coupon } from '../entities/coupon.entity';
import { CouponRepository } from '../repositories/coupon.repository';
import { CouponService } from '../coupon.service';

const mockCouponRepository = {
  findActiveByCode: jest.fn(),
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

describe('CouponService', () => {
  let service: CouponService;
  let couponRepository: jest.Mocked<CouponRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: CouponRepository, useValue: mockCouponRepository },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    couponRepository = module.get(CouponRepository) as jest.Mocked<CouponRepository>;
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return coupon when code is valid and active', async () => {
      const coupon = couponStub();
      couponRepository.findActiveByCode.mockResolvedValue(coupon);

      const result = await service.validate('SAVE10');

      expect(couponRepository.findActiveByCode).toHaveBeenCalledWith('SAVE10');
      expect(result).toEqual(coupon);
    });

    it('should throw NotFoundException (COUPON_001) when coupon not found', async () => {
      couponRepository.findActiveByCode.mockResolvedValue(null);

      await expect(service.validate('INVALID')).rejects.toThrow(NotFoundException);
      try {
        await service.validate('INVALID');
      } catch (error: any) {
        expect(error.response.code).toBe('COUPON_001');
      }
    });

    it('should throw BadRequestException (COUPON_002) when expired', async () => {
      const expiredCoupon = couponStub({ expiresAt: new Date('2020-01-01') });
      couponRepository.findActiveByCode.mockResolvedValue(expiredCoupon);

      await expect(service.validate('EXPIRED')).rejects.toThrow(BadRequestException);
      try {
        await service.validate('EXPIRED');
      } catch (error: any) {
        expect(error.response.code).toBe('COUPON_002');
      }
    });

    it('should throw BadRequestException (COUPON_003) when isActive is false', async () => {
      const inactiveCoupon = couponStub({ isActive: false });
      couponRepository.findActiveByCode.mockResolvedValue(inactiveCoupon);

      await expect(service.validate('INACTIVE')).rejects.toThrow(BadRequestException);
      try {
        await service.validate('INACTIVE');
      } catch (error: any) {
        expect(error.response.code).toBe('COUPON_003');
      }
    });

    it('should pass validation when expiresAt is null (no expiry)', async () => {
      const neverExpiresCoupon = couponStub({ expiresAt: null });
      couponRepository.findActiveByCode.mockResolvedValue(neverExpiresCoupon);

      const result = await service.validate('FOREVER');

      expect(result).toEqual(neverExpiresCoupon);
    });
  });

  describe('apply', () => {
    it('should calculate percent discount correctly (10% of 100000 = 10000 discount)', async () => {
      const percentCoupon = couponStub({ type: 'percent', value: 10 });
      couponRepository.findActiveByCode.mockResolvedValue(percentCoupon);

      const result = await service.apply('SAVE10', 100000);

      expect(result.couponCode).toBe('SAVE10');
      expect(result.discount).toBe(10000);
      expect(result.finalAmount).toBe(90000);
      expect(result.type).toBe('percent');
      expect(result.value).toBe(10);
    });

    it('should calculate fixed discount correctly (50000 fixed on 100000 = 50000 discount)', async () => {
      const fixedCoupon = couponStub({ code: 'SAVE50K', type: 'fixed', value: 50000 });
      couponRepository.findActiveByCode.mockResolvedValue(fixedCoupon);

      const result = await service.apply('SAVE50K', 100000);

      expect(result.couponCode).toBe('SAVE50K');
      expect(result.discount).toBe(50000);
      expect(result.finalAmount).toBe(50000);
      expect(result.type).toBe('fixed');
      expect(result.value).toBe(50000);
    });

    it('should cap fixed discount at subtotal (50000 fixed on 30000 = 30000 discount)', async () => {
      const fixedCoupon = couponStub({ code: 'SAVE50K', type: 'fixed', value: 50000 });
      couponRepository.findActiveByCode.mockResolvedValue(fixedCoupon);

      const result = await service.apply('SAVE50K', 30000);

      expect(result.discount).toBe(30000);
      expect(result.finalAmount).toBe(0);
    });

    it('should propagate validation errors from validate()', async () => {
      couponRepository.findActiveByCode.mockResolvedValue(null);

      await expect(service.apply('NOTFOUND', 100000)).rejects.toThrow(NotFoundException);
    });
  });
});
