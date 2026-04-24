import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';

import { AuthModule } from './features/auth/auth.module';
import { UserProfileModule } from './features/user-profile/user-profile.module';
import { ProductModule } from './features/product/product.module';
import { CartModule } from './features/cart/cart.module';
import { OrderModule } from './features/order/order.module';
import { ReviewModule } from './features/review/review.module';
import { WishlistModule } from './features/wishlist/wishlist.module';
import { CouponModule } from './features/coupon/coupon.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Core
    DatabaseModule,
    LoggerModule,

    // Features
    AuthModule,
    UserProfileModule,
    ProductModule,
    CartModule,
    OrderModule,
    ReviewModule,
    WishlistModule,
    CouponModule,
  ],
})
export class AppModule {}
