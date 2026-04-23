import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';

@Injectable()
export class WishlistRepository {
  constructor(
    @InjectRepository(Wishlist)
    private readonly repo: Repository<Wishlist>,
  ) {}

  findByUserId(userId: number): Promise<Wishlist | null> {
    return this.repo.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { items: { createdAt: 'DESC' } },
    });
  }

  create(data: Partial<Wishlist>): Promise<Wishlist> {
    const wishlist = this.repo.create(data);
    return this.repo.save(wishlist);
  }

  save(wishlist: Wishlist): Promise<Wishlist> {
    return this.repo.save(wishlist);
  }
}
