import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ProductVariantRepository } from '../product/repositories/product-variant.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from './entities/cart.entity';
import { CartItemRepository } from './repositories/cart-item.repository';
import { CartRepository } from './repositories/cart.repository';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly variantRepository: ProductVariantRepository,
  ) {}

  async getOrCreateCart(
    userId: number | null,
    sessionId?: string,
  ): Promise<{ cart: Cart; sessionId: string }> {
    const sid = sessionId ?? crypto.randomUUID();
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.cartRepository.findByUserId(userId);
    }
    if (!cart) {
      cart = await this.cartRepository.findBySessionId(sid);
    }
    if (!cart) {
      cart = await this.cartRepository.create({ userId: userId ?? null, sessionId: sid });
      cart.items = [];
    } else if (userId && cart.userId === null) {
      cart.userId = userId;
      cart = await this.cartRepository.save(cart);
    }

    return { cart, sessionId: sid };
  }

  async addItem(
    userId: number | null,
    sessionId: string | undefined,
    dto: AddCartItemDto,
  ): Promise<Cart> {
    const { cart, sessionId: sid } = await this.getOrCreateCart(userId, sessionId);

    const variant = await this.variantRepository.findById(dto.productVariantId);
    if (!variant) throw new NotFoundException('PROD_002');
    if (variant.stockQuantity < dto.quantity) throw new BadRequestException('PROD_003');

    const existing = await this.cartItemRepository.findByCartAndVariant(
      cart.id,
      dto.productVariantId,
    );

    if (existing) {
      existing.quantity += dto.quantity;
      await this.cartItemRepository.save(existing);
    } else {
      await this.cartItemRepository.create({
        cartId: cart.id,
        productVariantId: dto.productVariantId,
        quantity: dto.quantity,
      });
    }

    return this.reloadCart(userId, sid);
  }

  async updateItem(itemId: number, dto: UpdateCartItemDto, userId: number | null, sessionId?: string): Promise<Cart> {
    const item = await this.cartItemRepository.findById(itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    return this.reloadCart(userId, sessionId);
  }

  async removeItem(itemId: number, userId: number | null, sessionId?: string): Promise<Cart> {
    const item = await this.cartItemRepository.findById(itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartItemRepository.delete(itemId);
    return this.reloadCart(userId, sessionId);
  }

  async clearCart(userId: number | null, sessionId?: string): Promise<void> {
    const { cart } = await this.getOrCreateCart(userId, sessionId);
    await this.cartItemRepository.deleteByCartId(cart.id);
  }

  async mergeGuestCart(sessionId: string, userId: number): Promise<void> {
    const guestCart = await this.cartRepository.findBySessionId(sessionId);
    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.cartRepository.findByUserId(userId);
    if (!userCart) {
      guestCart.userId = userId;
      await this.cartRepository.save(guestCart);
      return;
    }

    for (const guestItem of guestCart.items) {
      const existing = await this.cartItemRepository.findByCartAndVariant(
        userCart.id,
        guestItem.productVariantId,
      );
      if (existing) {
        existing.quantity += guestItem.quantity;
        await this.cartItemRepository.save(existing);
      } else {
        await this.cartItemRepository.create({
          cartId: userCart.id,
          productVariantId: guestItem.productVariantId,
          quantity: guestItem.quantity,
        });
      }
    }

    await this.cartItemRepository.deleteByCartId(guestCart.id);
  }

  private async reloadCart(userId: number | null, sessionId?: string): Promise<Cart> {
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : sessionId
        ? await this.cartRepository.findBySessionId(sessionId)
        : null;
    if (!cart) throw new NotFoundException('CART_001');
    return cart;
  }
}
