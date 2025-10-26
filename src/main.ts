import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Seeder } from './seeders';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global class serializer interceptor to handle @Exclude() decorators
  // Note: Applied per endpoint instead of globally to avoid interfering with auth validation
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get('Reflector')));

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // API prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('4AMI Platform API')
    .setDescription('4AMI Platform Backend MVP API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Run database seeder on startup (only in production)
  if (configService.get('NODE_ENV') === 'production') {
    try {
      console.log('🌱 Running database seeder...');
      const dataSource = app.get(DataSource);
      const seeder = new Seeder(dataSource);
      await seeder.run();
      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      // Don't exit the app, just log the error
    }
  }

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 4AMI Backend is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
// Test hot reloading - Wed Sep 10 10:54:06 AM +06 2025
