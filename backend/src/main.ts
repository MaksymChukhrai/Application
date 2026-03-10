import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { validationPipe } from './common/pipes/validation.pipe';
import { DataSource } from 'typeorm';
import { runSeed } from './database/seeds/seed';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(validationPipe);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Event Management API')
    .setDescription('REST API for Event Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Ensure DataSource is initialized and schema is synchronized before seeding
  const dataSource = app.get(DataSource);
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  await runSeed(dataSource);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`✅ Server is running on: http://localhost:${port}/api`);
  logger.log(`📄 Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`🗄️  Database connected and seeded successfully`);
}

void bootstrap();
