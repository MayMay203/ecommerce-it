import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum OrderStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class QueryOrderDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status?: string;

  @IsOptional()
  sort?: string = 'createdAt';

  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}
