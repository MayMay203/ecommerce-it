import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Coupon } from './entities/coupon.entity';
import { CouponRepository } from './repositories/coupon.repository';

export interface ApplyCouponResult {
  couponCode: string;
  discount: number;
  finalAmount: number;
  type: string;
  value: number;
}

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(private readonly couponRepository: CouponRepository) {}

  async validate(code: string): Promise<Coupon> {
    this.logger.log(`Validating coupon: ${code}`);

    const coupon = await this.couponRepository.findActiveByCode(code);
    if (!coupon) {
      throw new NotFoundException({ code: 'COUPON_001', message: 'Coupon not found' });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException({ code: 'COUPON_002', message: 'Coupon has expired' });
    }

    if (!coupon.isActive) {
      throw new BadRequestException({ code: 'COUPON_003', message: 'Coupon is not active' });
    }

    return coupon;
  }

  async apply(code: string, subtotal: number): Promise<ApplyCouponResult> {
    this.logger.log(`Applying coupon: ${code}, subtotal: ${subtotal}`);

    const coupon = await this.validate(code);

    let discount: number;
    if (coupon.type === 'percent') {
      discount = (subtotal * Number(coupon.value)) / 100;
    } else {
      discount = Math.min(Number(coupon.value), subtotal);
    }

    const finalAmount = subtotal - discount;

    return {
      couponCode: coupon.code,
      discount,
      finalAmount,
      type: coupon.type,
      value: Number(coupon.value),
    };
  }
}
