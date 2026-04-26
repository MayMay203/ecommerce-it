import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export enum PaymentMethodEnum {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export class CreateOrderDto {
  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  paymentMethod: string;

  @IsOptional()
  @IsNumber()
  shippingAddressId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  selectedItemIds?: number[];
}
