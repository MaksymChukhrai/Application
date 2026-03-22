import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TagsModule } from '../tags/tags.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    TagsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway],
  exports: [EventsService, EventsGateway], 
})
export class EventsModule {}