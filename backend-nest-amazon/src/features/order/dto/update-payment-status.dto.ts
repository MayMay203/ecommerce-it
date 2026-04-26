import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PaymentStatusEnum {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatusEnum)
  @IsNotEmpty()
  paymentStatus: string;
}
