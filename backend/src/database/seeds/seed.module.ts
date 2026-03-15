import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { Tag } from '../../tags/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Event, Tag])],
})
export class SeedModule {}
