import { Test, TestingModule } from '@nestjs/testing';
import type { IUserPayload } from '../../../shared/decorators/current-user.decorator';
import { WishlistController } from '../wishlist.controller';
import { WishlistService } from '../wishlist.service';

const mockWishlistService = {
  getWishlist: jest.fn(),
  countItems: jest.fn(),
  addItem: jest.fn(),
  removeItem: jest.fn(),
  clearWishlist: jest.fn(),
};

const userPayload: IUserPayload = {
  sub: 42,
  email: 'u@x.com',
  role: 'customer',
};

describe('WishlistController', () => {
  let controller: WishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [{ provide: WishlistService, useValue: mockWishlistService }],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
    jest.clearAllMocks();
  });

  describe('GET /wishlist', () => {
    it('delegates to service with the current user id', async () => {
      const wishlist = { id: 10, userId: 42, items: [] };
      mockWishlistService.getWishlist.mockResolvedValue(wishlist);

      const result = await controller.getWishlist(userPayload);

      expect(mockWishlistService.getWishlist).toHaveBeenCalledWith(42);
      expect(result).toEqual({ data: wishlist, message: 'Wishlist retrieved' });
    });
  });

  describe('GET /wishlist/count', () => {
    it('returns the count payload', async () => {
      mockWishlistService.countItems.mockResolvedValue({ count: 5 });

      const result = await controller.getCount(userPayload);

      expect(mockWishlistService.countItems).toHaveBeenCalledWith(42);
      expect(result).toEqual({
        data: { count: 5 },
        message: 'Wishlist count retrieved',
      });
    });
  });

  describe('POST /wishlist/items', () => {
    it('forwards the DTO to the service', async () => {
      const dto = { productId: 7 };
      const wishlist = { id: 10, userId: 42, items: [{ productId: 7 }] };
      mockWishlistService.addItem.mockResolvedValue(wishlist);

      const result = await controller.addItem(userPayload, dto);

      expect(mockWishlistService.addItem).toHaveBeenCalledWith(42, dto);
      expect(result).toEqual({
        data: wishlist,
        message: 'Product added to wishlist',
      });
    });
  });

  describe('DELETE /wishlist/items/:productId', () => {
    it('passes the parsed productId to the service', async () => {
      const wishlist = { id: 10, userId: 42, items: [] };
      mockWishlistService.removeItem.mockResolvedValue(wishlist);

      const result = await controller.removeItem(userPayload, 7);

      expect(mockWishlistService.removeItem).toHaveBeenCalledWith(42, 7);
      expect(result).toEqual({
        data: wishlist,
        message: 'Product removed from wishlist',
      });
    });
  });

  describe('DELETE /wishlist', () => {
    it('clears the wishlist', async () => {
      mockWishlistService.clearWishlist.mockResolvedValue(undefined);

      const result = await controller.clearWishlist(userPayload);

      expect(mockWishlistService.clearWishlist).toHaveBeenCalledWith(42);
      expect(result).toEqual({ data: null, message: 'Wishlist cleared' });
    });
  });
});
