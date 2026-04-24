import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';

@Injectable()
export class CouponRepository {
  constructor(
    @InjectRepository(Coupon)
    private readonly repo: Repository<Coupon>,
  ) {}

  findActiveByCode(code: string): Promise<Coupon | null> {
    return this.repo.findOne({ where: { code } });
  }
}
