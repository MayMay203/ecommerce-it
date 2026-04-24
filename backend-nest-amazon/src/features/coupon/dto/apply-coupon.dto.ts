import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  subtotal: number;
}
