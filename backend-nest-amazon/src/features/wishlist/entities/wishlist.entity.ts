import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { WishlistItem } from './wishlist-item.entity';

@Entity('wishlists')
@Unique(['userId'])
export class Wishlist {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({
    name: 'user_id',
    type: 'bigint',
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => WishlistItem, (item) => item.wishlist, { cascade: true })
  items: WishlistItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
