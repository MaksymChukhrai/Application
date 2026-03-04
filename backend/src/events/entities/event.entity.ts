import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EventVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column()
  location: string;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({
    type: 'enum',
    enum: EventVisibility,
    default: EventVisibility.PUBLIC,
  })
  visibility: EventVisibility;

  @ManyToOne(() => User, (user) => user.organizedEvents, { eager: false })
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @Column()
  organizerId: string;

  @ManyToMany(() => User, (user) => user.participatedEvents, { eager: false })
  @JoinTable({
    name: 'participants',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
