// Libs
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
// Common
import { Uuid } from '@app/common';
// App
import { User } from '../../user/entities/user.entity';

@Entity('refresh-token')
export class RefreshToken {
  constructor(data?: Partial<RefreshToken>) {
    Object.assign(this, data);
  }

  @PrimaryColumn('varchar')
  refresh_token_hashed: string;

  @Column({ type: 'uuid' })
  iuser_id: Uuid;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamptz' })
  expired_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.refresh_tokens)
  @JoinColumn({ name: 'iuser_id' })
  user: User;
}
