import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from '../../product/entities/product-variant.entity';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({
    name: 'cart_id',
    type: 'bigint',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  cartId: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({
    name: 'product_variant_id',
    type: 'bigint',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  productVariantId: number;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
