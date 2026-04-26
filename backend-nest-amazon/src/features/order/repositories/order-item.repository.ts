import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repo: Repository<OrderItem>,
  ) {}

  async findByOrderId(orderId: number) {
    return this.repo.find({
      where: { orderId },
      relations: ['productVariant'],
    });
  }

  async createBatch(items: OrderItem[]) {
    return this.repo.save(items);
  }

  async create(item: Partial<OrderItem>) {
    const newItem = this.repo.create(item);
    return this.repo.save(newItem);
  }
}
