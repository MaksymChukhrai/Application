import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User]),
    ConfigModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}