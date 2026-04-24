import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { CouponService } from './coupon.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validate(@Body() dto: ValidateCouponDto) {
    const coupon = await this.couponService.validate(dto.code);
    return {
      data: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        expiresAt: coupon.expiresAt,
      },
      message: 'Coupon is valid',
    };
  }

  @Public()
  @Post('apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a coupon and calculate discount' })
  async apply(@Body() dto: ApplyCouponDto) {
    const result = await this.couponService.apply(dto.code, dto.subtotal);
    return { data: result, message: 'Coupon applied successfully' };
  }
}
