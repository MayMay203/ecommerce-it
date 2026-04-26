import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { ProductVariantRepository } from '../product/repositories/product-variant.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderRepository } from './repositories/order.repository';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly cartService: CartService,
    private readonly variantRepository: ProductVariantRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { cart } = await this.cartService.getOrCreateCart(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Filter items by selected IDs if provided
      const itemsToCheckout = dto.selectedItemIds && dto.selectedItemIds.length > 0
        ? cart.items.filter((item) => dto.selectedItemIds!.includes(item.id))
        : cart.items;

      if (itemsToCheckout.length === 0) {
        throw new BadRequestException('No items selected for checkout');
      }

      let totalAmount = 0;
      const shippingFee = 10;
      const orderItems: OrderItem[] = [];

      for (const cartItem of itemsToCheckout) {
        const variant = await this.variantRepository.findById(cartItem.productVariantId);
        if (!variant) {
          throw new NotFoundException(
            `Product variant #${cartItem.productVariantId} not found`,
          );
        }

        if (variant.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for SKU: ${variant.sku}`,
          );
        }

        const itemTotal = (variant.salePrice || variant.price) * cartItem.quantity;
        totalAmount += itemTotal;

        const orderItem = new OrderItem();
        orderItem.productVariantId = variant.id;
        orderItem.productName = variant.product?.name || 'Unknown Product';
        orderItem.sku = variant.sku;
        orderItem.price = variant.salePrice || variant.price;
        orderItem.quantity = cartItem.quantity;
        orderItem.thumbnailUrl = variant.product?.thumbnailUrl || null;

        orderItems.push(orderItem);

        await queryRunner.manager.decrement(
          'product_variants',
          { id: variant.id },
          'stock_quantity',
          cartItem.quantity,
        );
      }

      totalAmount += shippingFee;

      const order = new Order();
      order.userId = userId;
      order.status = OrderStatus.PENDING;
      order.paymentMethod = dto.paymentMethod;
      order.paymentStatus = PaymentStatus.UNPAID;
      order.shippingFee = shippingFee;
      order.totalAmount = totalAmount;
      order.shippingAddress = {
        addressId: dto.shippingAddressId || null,
        createdAt: new Date(),
      };

      const savedOrder = await queryRunner.manager.save(Order, order);

      for (const item of orderItems) {
        item.orderId = savedOrder.id;
      }

      await queryRunner.manager.save(OrderItem, orderItems);

      await queryRunner.manager.delete('cart_items', { cartId: cart.id });

      await queryRunner.commitTransaction();

      this.logger.log(`Order #${savedOrder.id} created for user #${userId}`);
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserOrders(
    userId: number,
    skip: number = 0,
    take: number = 10,
    status?: string,
  ) {
    const [orders, total] = await this.orderRepository.findOrdersByUserId(
      userId,
      skip,
      take,
      status,
    );

    return {
      data: orders,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getOrderDetail(orderId: number, userId: number) {
    const order = await this.orderRepository.findOrderWithItems(orderId, userId);
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    return order;
  }

  async cancelOrder(orderId: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOrderWithItems(orderId, userId);
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.orderRepository.save(order);

    this.logger.log(`Order #${orderId} cancelled by user #${userId}`);
    return updatedOrder;
  }

  async getAllOrders(
    skip: number = 0,
    take: number = 10,
    status?: string,
  ) {
    const [orders, total] = await this.orderRepository.findAllOrders(
      skip,
      take,
      status,
    );

    return {
      data: orders,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async updateOrderStatus(orderId: number, newStatus: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    order.status = newStatus as OrderStatus;
    const updated = await this.orderRepository.save(order);
    this.logger.log(`Order #${orderId} status updated to ${newStatus}`);
    return updated;
  }

  async updatePaymentStatus(orderId: number, newStatus: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    order.paymentStatus = newStatus as PaymentStatus;
    const updated = await this.orderRepository.save(order);
    this.logger.log(
      `Order #${orderId} payment status updated to ${newStatus}`,
    );
    return updated;
  }
}
