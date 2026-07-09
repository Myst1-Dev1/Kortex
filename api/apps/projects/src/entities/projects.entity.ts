import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IParticipants } from '../interfaces/project-interfaces';

@Entity('projects')
export class Projects {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'author_id' })
    author_id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    description!: string;

    @Column({ type: 'timestamp', name: 'deadline_for_completion' })
    deadline_for_completion!: Date;

    @Column('jsonb', { nullable: true, default: () => "'[]'" })
    participants!: IParticipants[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}