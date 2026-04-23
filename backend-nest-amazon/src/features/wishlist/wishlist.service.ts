import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ProductService } from '../product/services/product.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItemRepository } from './repositories/wishlist-item.repository';
import { WishlistRepository } from './repositories/wishlist.repository';

const MYSQL_DUPLICATE_KEY_ERRNO = 1062;

function isDuplicateKeyError(err: unknown): boolean {
  return (
    err instanceof QueryFailedError &&
    (err as QueryFailedError & { driverError?: { errno?: number } }).driverError
      ?.errno === MYSQL_DUPLICATE_KEY_ERRNO
  );
}

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly wishlistItemRepository: WishlistItemRepository,
    private readonly productService: ProductService,
  ) {}

  async getOrCreateWishlist(userId: number): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findByUserId(userId);
    if (!wishlist) {
      wishlist = await this.wishlistRepository.create({ userId });
      wishlist.items = [];
    }
    return wishlist;
  }

  async getWishlist(userId: number): Promise<Wishlist> {
    return this.getOrCreateWishlist(userId);
  }

  async countItems(userId: number): Promise<{ count: number }> {
    const wishlist = await this.wishlistRepository.findByUserId(userId);
    if (!wishlist) return { count: 0 };
    const count = await this.wishlistItemRepository.countByWishlistId(
      wishlist.id,
    );
    return { count };
  }

  async addItem(userId: number, dto: AddWishlistItemDto): Promise<Wishlist> {
    // Validate product first so an invalid productId never creates an empty wishlist row.
    await this.productService.findOne(dto.productId);

    const wishlist = await this.getOrCreateWishlist(userId);

    const existing = await this.wishlistItemRepository.findByWishlistAndProduct(
      wishlist.id,
      dto.productId,
    );
    if (existing) {
      throw new ConflictException('WISHLIST_002');
    }

    try {
      await this.wishlistItemRepository.create({
        wishlistId: wishlist.id,
        productId: dto.productId,
      });
    } catch (err) {
      // Concurrent request inserted the same (wishlist_id, product_id) between
      // our check and this insert — the DB unique constraint caught it.
      if (isDuplicateKeyError(err)) {
        throw new ConflictException('WISHLIST_002');
      }
      throw err;
    }

    return this.getWishlist(userId);
  }

  async removeItem(userId: number, productId: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findByUserId(userId);
    if (!wishlist) {
      throw new NotFoundException('WISHLIST_001');
    }

    const deleted =
      await this.wishlistItemRepository.deleteByWishlistAndProduct(
        wishlist.id,
        productId,
      );
    if (deleted === 0) {
      throw new NotFoundException(`Product #${productId} is not in wishlist`);
    }

    return this.getWishlist(userId);
  }

  async clearWishlist(userId: number): Promise<void> {
    const wishlist = await this.wishlistRepository.findByUserId(userId);
    if (!wishlist) return;
    await this.wishlistItemRepository.deleteByWishlistId(wishlist.id);
  }
}
