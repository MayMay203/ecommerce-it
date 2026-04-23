import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from '../entities/wishlist-item.entity';

@Injectable()
export class WishlistItemRepository {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly repo: Repository<WishlistItem>,
  ) {}

  findByWishlistAndProduct(
    wishlistId: number,
    productId: number,
  ): Promise<WishlistItem | null> {
    return this.repo.findOne({ where: { wishlistId, productId } });
  }

  create(data: Partial<WishlistItem>): Promise<WishlistItem> {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  save(item: WishlistItem): Promise<WishlistItem> {
    return this.repo.save(item);
  }

  async deleteByWishlistAndProduct(
    wishlistId: number,
    productId: number,
  ): Promise<number> {
    const result = await this.repo.delete({ wishlistId, productId });
    return result.affected ?? 0;
  }

  async deleteByWishlistId(wishlistId: number): Promise<void> {
    await this.repo.delete({ wishlistId });
  }

  countByWishlistId(wishlistId: number): Promise<number> {
    return this.repo.count({ where: { wishlistId } });
  }
}
