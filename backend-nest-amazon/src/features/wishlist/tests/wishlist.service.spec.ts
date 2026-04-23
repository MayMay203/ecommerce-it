import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Product } from '../../product/entities/product.entity';
import { ProductService } from '../../product/services/product.service';
import type { WishlistItem } from '../entities/wishlist-item.entity';
import type { Wishlist } from '../entities/wishlist.entity';
import { WishlistItemRepository } from '../repositories/wishlist-item.repository';
import { WishlistRepository } from '../repositories/wishlist.repository';
import { WishlistService } from '../wishlist.service';

const mockWishlistRepository = {
  findByUserId: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockWishlistItemRepository = {
  findByWishlistAndProduct: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  deleteByWishlistAndProduct: jest.fn(),
  deleteByWishlistId: jest.fn(),
  countByWishlistId: jest.fn(),
};

const mockProductService = {
  findOne: jest.fn(),
};

const productStub = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 1,
    name: 'Kindle Paperwhite',
    slug: 'kindle-paperwhite',
    ...overrides,
  }) as Product;

const wishlistStub = (overrides: Partial<Wishlist> = {}): Wishlist =>
  ({
    id: 10,
    userId: 42,
    items: [],
    createdAt: new Date('2026-01-01'),
    ...overrides,
  }) as Wishlist;

const itemStub = (overrides: Partial<WishlistItem> = {}): WishlistItem =>
  ({
    id: 100,
    wishlistId: 10,
    productId: 1,
    product: productStub(),
    createdAt: new Date('2026-01-01'),
    ...overrides,
  }) as WishlistItem;

describe('WishlistService', () => {
  let service: WishlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: WishlistRepository, useValue: mockWishlistRepository },
        {
          provide: WishlistItemRepository,
          useValue: mockWishlistItemRepository,
        },
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    jest.resetAllMocks();
  });

  // -------------------------------------------------------------------------
  describe('getOrCreateWishlist', () => {
    it('returns existing wishlist when one exists for the user', async () => {
      const wishlist = wishlistStub();
      mockWishlistRepository.findByUserId.mockResolvedValue(wishlist);

      const result = await service.getOrCreateWishlist(42);

      expect(mockWishlistRepository.findByUserId).toHaveBeenCalledWith(42);
      expect(mockWishlistRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(wishlist);
    });

    it('creates a new wishlist when none exists', async () => {
      const created = wishlistStub();
      mockWishlistRepository.findByUserId.mockResolvedValue(null);
      mockWishlistRepository.create.mockResolvedValue(created);

      const result = await service.getOrCreateWishlist(42);

      expect(mockWishlistRepository.create).toHaveBeenCalledWith({
        userId: 42,
      });
      expect(result.items).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  describe('countItems', () => {
    it('returns 0 when user has no wishlist', async () => {
      mockWishlistRepository.findByUserId.mockResolvedValue(null);

      const result = await service.countItems(42);

      expect(result).toEqual({ count: 0 });
      expect(
        mockWishlistItemRepository.countByWishlistId,
      ).not.toHaveBeenCalled();
    });

    it('returns the item count when wishlist exists', async () => {
      mockWishlistRepository.findByUserId.mockResolvedValue(wishlistStub());
      mockWishlistItemRepository.countByWishlistId.mockResolvedValue(3);

      const result = await service.countItems(42);

      expect(mockWishlistItemRepository.countByWishlistId).toHaveBeenCalledWith(
        10,
      );
      expect(result).toEqual({ count: 3 });
    });
  });

  // -------------------------------------------------------------------------
  describe('addItem', () => {
    it('adds a new product to the wishlist and returns the refreshed wishlist', async () => {
      const wishlist = wishlistStub({ items: [itemStub()] });
      mockProductService.findOne.mockResolvedValue(productStub());
      mockWishlistRepository.findByUserId.mockResolvedValue(wishlist);
      mockWishlistItemRepository.findByWishlistAndProduct.mockResolvedValue(
        null,
      );
      mockWishlistItemRepository.create.mockResolvedValue(itemStub());

      const result = await service.addItem(42, { productId: 1 });

      expect(mockWishlistItemRepository.create).toHaveBeenCalledWith({
        wishlistId: 10,
        productId: 1,
      });
      expect(result).toEqual(wishlist);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      mockProductService.findOne.mockRejectedValue(
        new NotFoundException('Product #999 not found'),
      );

      await expect(service.addItem(42, { productId: 999 })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockWishlistItemRepository.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException WISHLIST_002 when the product is already in the wishlist', async () => {
      mockProductService.findOne.mockResolvedValue(productStub());
      mockWishlistRepository.findByUserId.mockResolvedValue(wishlistStub());
      mockWishlistItemRepository.findByWishlistAndProduct.mockResolvedValue(
        itemStub(),
      );

      await expect(service.addItem(42, { productId: 1 })).rejects.toThrow(
        ConflictException,
      );
      await expect(service.addItem(42, { productId: 1 })).rejects.toThrow(
        'WISHLIST_002',
      );
      expect(mockWishlistItemRepository.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe('removeItem', () => {
    it('removes the product and returns refreshed wishlist', async () => {
      const wishlist = wishlistStub({ items: [] });
      mockWishlistRepository.findByUserId.mockResolvedValue(wishlist);
      mockWishlistItemRepository.deleteByWishlistAndProduct.mockResolvedValue(
        1,
      );

      const result = await service.removeItem(42, 1);

      expect(
        mockWishlistItemRepository.deleteByWishlistAndProduct,
      ).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual(wishlist);
    });

    it('throws NotFoundException WISHLIST_001 when the user has no wishlist', async () => {
      mockWishlistRepository.findByUserId.mockResolvedValue(null);

      await expect(service.removeItem(42, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.removeItem(42, 1)).rejects.toThrow('WISHLIST_001');
      expect(
        mockWishlistItemRepository.deleteByWishlistAndProduct,
      ).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the product is not in the wishlist', async () => {
      mockWishlistRepository.findByUserId.mockResolvedValue(wishlistStub());
      mockWishlistItemRepository.deleteByWishlistAndProduct.mockResolvedValue(
        0,
      );

      await expect(service.removeItem(42, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.removeItem(42, 1)).rejects.toThrow(
        'Product #1 is not in wishlist',
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('clearWishlist', () => {
    it('deletes all items when wishlist exists', async () => {
      mockWishlistRepository.findByUserId.mockResolvedValue(wishlistStub());

      await service.clearWishlist(42);

      expect(
        mockWishlistItemRepository.deleteByWishlistId,
      ).toHaveBeenCalledWith(10);
    });

    it('is a no-op when the user has no wishlist', async () => {
      mockWishlistRepository.findByUserId.mockResolvedValue(null);

      await service.clearWishlist(42);

      expect(
        mockWishlistItemRepository.deleteByWishlistId,
      ).not.toHaveBeenCalled();
    });
  });
});
