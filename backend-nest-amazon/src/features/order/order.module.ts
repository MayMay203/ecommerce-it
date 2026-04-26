import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderRepository } from './repositories/order.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule,
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderItemRepository],
  exports: [OrderService, OrderRepository, OrderItemRepository],
})
export class OrderModule {}
