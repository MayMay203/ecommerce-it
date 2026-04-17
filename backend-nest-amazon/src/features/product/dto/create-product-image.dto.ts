import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateProductImageDto {
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(500)
  imageUrl: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
