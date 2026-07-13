import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from './chat.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'chat_id' })
  @Index()
  chat_id!: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat!: Chat;

  @Column({ type: 'uuid', name: 'sender_id' })
  @Index()
  sender_id!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'boolean', default: false })
  edited!: boolean;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
