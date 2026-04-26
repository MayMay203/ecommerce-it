import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { CartItemRepository } from './repositories/cart-item.repository';
import { CartRepository } from './repositories/cart.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), ProductModule],
  controllers: [CartController],
  providers: [CartService, CartRepository, CartItemRepository],
  exports: [CartService, CartRepository, CartItemRepository],
})
export class CartModule {}
