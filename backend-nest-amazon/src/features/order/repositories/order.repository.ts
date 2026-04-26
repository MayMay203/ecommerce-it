import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async findOrdersByUserId(userId: number, skip: number, take: number, status?: string) {
    const query = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'items')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    return query.getManyAndCount();
  }

  async findOrderWithItems(orderId: number, userId: number) {
    return this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'items')
      .where('order.id = :orderId', { orderId })
      .andWhere('order.userId = :userId', { userId })
      .getOne();
  }

  async findAllOrders(skip: number, take: number, status?: string) {
    const query = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'items')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    return query.getManyAndCount();
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['orderItems'],
    });
  }

  async create(order: Partial<Order>) {
    const newOrder = this.repo.create(order);
    return this.repo.save(newOrder);
  }

  async save(order: Order) {
    return this.repo.save(order);
  }
}
