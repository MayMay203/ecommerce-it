import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from '../../product/entities/product-variant.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({
    name: 'order_id',
    type: 'bigint',
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  orderId: number;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    name: 'product_variant_id',
    type: 'bigint',
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  productVariantId: number;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 255,
  })
  productName: string;

  @Column({
    name: 'sku',
    type: 'varchar',
    length: 100,
  })
  sku: string;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    name: 'quantity',
    type: 'int',
  })
  quantity: number;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailUrl: string | null;
}
