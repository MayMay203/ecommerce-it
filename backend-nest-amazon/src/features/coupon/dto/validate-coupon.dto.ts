import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
