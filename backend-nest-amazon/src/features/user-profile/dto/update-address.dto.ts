import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  fullName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @MinLength(10)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressLine?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;
}
