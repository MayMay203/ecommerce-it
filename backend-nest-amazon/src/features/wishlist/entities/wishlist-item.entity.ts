import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Wishlist } from './wishlist.entity';

@Entity('wishlist_items')
@Unique(['wishlistId', 'productId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({
    name: 'wishlist_id',
    type: 'bigint',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  wishlistId: number;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: Wishlist;

  @Column({
    name: 'product_id',
    type: 'bigint',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
