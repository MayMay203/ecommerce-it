export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export interface OrderItem {
  id: number;
  orderId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  thumbnailUrl: string | null;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: Record<string, any>;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface CreateOrderDto {
  paymentMethod: string;
  shippingAddressId?: number;
  selectedItemIds?: number[];
}

export interface CancelOrderDto {
  reason?: string;
}
