import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { IUserPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { OrderService } from './order.service';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order from cart' })
  async createOrder(
    @CurrentUser() user: IUserPayload,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.orderService.createOrder(user.sub, dto);
    return {
      success: true,
      data: order,
      message: 'Order created successfully',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List user orders' })
  async listUserOrders(
    @CurrentUser() user: IUserPayload,
    @Query() query: QueryOrderDto,
  ) {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);
    const result = await this.orderService.getUserOrders(
      user.sub,
      skip,
      query.limit,
      query.status,
    );

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get order details' })
  async getOrderDetail(
    @CurrentUser() user: IUserPayload,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    const order = await this.orderService.getOrderDetail(orderId, user.sub);
    return {
      success: true,
      data: order,
    };
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @CurrentUser() user: IUserPayload,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    const order = await this.orderService.cancelOrder(orderId, user.sub);
    return {
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    };
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all orders (admin)' })
  async listAllOrders(@Query() query: QueryOrderDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);
    const result = await this.orderService.getAllOrders(
      skip,
      query.limit,
      query.status,
    );

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update order status (admin)' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(orderId, dto.status);
    return {
      success: true,
      data: order,
      message: 'Order status updated',
    };
  }

  @Patch('admin/:id/payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update payment status (admin)' })
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    const order = await this.orderService.updatePaymentStatus(
      orderId,
      dto.paymentStatus,
    );
    return {
      success: true,
      data: order,
      message: 'Payment status updated',
    };
  }
}
