import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { IUserPayload } from '../../shared/decorators/current-user.decorator';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  async getWishlist(@CurrentUser() user: IUserPayload) {
    const wishlist = await this.wishlistService.getWishlist(user.sub);
    return { data: wishlist, message: 'Wishlist retrieved' };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get wishlist item count (for header badge)' })
  async getCount(@CurrentUser() user: IUserPayload) {
    const count = await this.wishlistService.countItems(user.sub);
    return { data: count, message: 'Wishlist count retrieved' };
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a product to the wishlist' })
  async addItem(
    @CurrentUser() user: IUserPayload,
    @Body() dto: AddWishlistItemDto,
  ) {
    const wishlist = await this.wishlistService.addItem(user.sub, dto);
    return { data: wishlist, message: 'Product added to wishlist' };
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  async removeItem(
    @CurrentUser() user: IUserPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const wishlist = await this.wishlistService.removeItem(user.sub, productId);
    return { data: wishlist, message: 'Product removed from wishlist' };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear wishlist' })
  async clearWishlist(@CurrentUser() user: IUserPayload) {
    await this.wishlistService.clearWishlist(user.sub);
    return { data: null, message: 'Wishlist cleared' };
  }
}
