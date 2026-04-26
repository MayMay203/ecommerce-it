import { IsEnum, IsNotEmpty } from 'class-validator';

export enum OrderStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusEnum)
  @IsNotEmpty()
  status: string;
}
