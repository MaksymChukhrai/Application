import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tags')
export class Tag {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Tech' })
  @Column({ unique: true })
  name: string;

  // ManyToMany defined on Event side (owning side)
  // We don't need @ManyToMany here unless we need tag.events
}
