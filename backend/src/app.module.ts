import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { SeedModule } from './database/seeds/seed.module';
import { TagsModule } from './tags/tags.module';
import { User } from './users/entities/user.entity';
import { Event } from './events/entities/event.entity';
import { Tag } from './tags/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [User, Event, Tag], // added Tag
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    EventsModule,
    UsersModule,
    HealthModule,
    SeedModule,
    TagsModule, // added
  ],
})
export class AppModule {}
