import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(10)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  addressLine: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ward: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode: string;
}
