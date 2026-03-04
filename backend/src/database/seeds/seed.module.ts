import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Event])],
})
export class SeedModule {}
