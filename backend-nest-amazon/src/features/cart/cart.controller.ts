import * as crypto from 'crypto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { IUserPayload } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const SESSION_COOKIE = 'cart_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getSessionId(req: Request, res: Response): string {
    const existing = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (existing) return existing;
    const newSid = crypto.randomUUID();
    res.cookie(SESSION_COOKIE, newSid, {
      httpOnly: true,
      maxAge: SESSION_TTL_MS,
      sameSite: 'lax',
    });
    return newSid;
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: IUserPayload,
  ) {
    const sessionId = this.getSessionId(req, res);
    const { cart } = await this.cartService.getOrCreateCart(user?.sub ?? null, sessionId);
    return { data: cart, message: 'Cart retrieved' };
  }

  @Public()
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
    @CurrentUser() user?: IUserPayload,
  ) {
    const sessionId = this.getSessionId(req, res);
    const cart = await this.cartService.addItem(user?.sub ?? null, sessionId, dto);
    return { data: cart, message: 'Item added to cart' };
  }

  @Public()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: IUserPayload,
  ) {
    const sessionId = this.getSessionId(req, res);
    const cart = await this.cartService.updateItem(id, dto, user?.sub ?? null, sessionId);
    return { data: cart, message: 'Cart item updated' };
  }

  @Public()
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: IUserPayload,
  ) {
    const sessionId = this.getSessionId(req, res);
    const cart = await this.cartService.removeItem(id, user?.sub ?? null, sessionId);
    return { data: cart, message: 'Cart item removed' };
  }

  @Public()
  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: IUserPayload,
  ) {
    const sessionId = this.getSessionId(req, res);
    await this.cartService.clearCart(user?.sub ?? null, sessionId);
    return { data: null, message: 'Cart cleared' };
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge guest cart into user cart on login' })
  async mergeCart(
    @Req() req: Request,
    @CurrentUser() user: IUserPayload,
  ) {
    const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (sessionId) {
      await this.cartService.mergeGuestCart(sessionId, user.sub);
    }
    return { data: null, message: 'Cart merged' };
  }
}
