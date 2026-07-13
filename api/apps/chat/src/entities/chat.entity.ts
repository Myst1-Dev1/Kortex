import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'project_id', unique: true })
  @Index()
  project_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
