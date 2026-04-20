import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly repo: Repository<Cart>,
  ) {}

  findByUserId(userId: number): Promise<Cart | null> {
    return this.repo.findOne({
      where: { userId },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });
  }

  findBySessionId(sessionId: string): Promise<Cart | null> {
    return this.repo.findOne({
      where: { sessionId },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });
  }

  create(data: Partial<Cart>): Promise<Cart> {
    const cart = this.repo.create(data);
    return this.repo.save(cart);
  }

  save(cart: Cart): Promise<Cart> {
    return this.repo.save(cart);
  }

  async clearItems(cartId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .relation(Cart, 'items')
      .of(cartId)
      .loadMany()
      .then(async () => {
        await this.repo.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
      });
  }
}
