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
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins: string[] = [
        'http://localhost:5173',
        'http://localhost:80',
        process.env.FRONTEND_URL,
      ].filter((o): o is string => Boolean(o));

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
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
