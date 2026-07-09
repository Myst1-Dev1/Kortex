import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Tasks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  project_id: string;

  @Column('uuid')
  task_author_id: string;

  @Column('uuid', { nullable: true })
  assigned_user_id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column({ length: 50 })
  status: string;

  @Column({ nullable: true })
  time_estimated: string;

  @Column({ nullable: true })
  time_concluded: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}