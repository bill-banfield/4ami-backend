import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

// Configuration
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { mailConfig } from './config/mail.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ReportsModule } from './modules/reports/reports.module';
import { EmailModule } from './modules/email/email.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';

// Common
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, mailConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Support for Railway DATABASE_URL
        const databaseUrl = configService.get('database.url');
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Enable for Railway deployment
            logging: configService.get('NODE_ENV') === 'development',
            ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Fallback to individual connection parameters
        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true, // Enable for Railway deployment
          logging: configService.get('NODE_ENV') === 'development',
          ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),

    // Redis & Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),

    // Mailer
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mailConfig = {
          transport: {
            host: configService.get('mail.host'),
            port: configService.get('mail.port'),
            secure: configService.get('mail.port') === '465', // Use SSL for port 465
            auth: {
              user: configService.get('mail.user'),
              pass: configService.get('mail.pass'),
            },
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000,   // 30 seconds
            socketTimeout: 60000,     // 60 seconds
            // Railway-specific settings
            tls: {
              rejectUnauthorized: false, // Allow self-signed certificates
              ciphers: 'SSLv3',
            },
            // Additional Railway network settings
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 20000,
            rateLimit: 5,
          },
          defaults: {
            from: configService.get('mail.from'),
          },
        };

        // Log email configuration (without password)
        console.log('📧 Email Config:', {
          host: mailConfig.transport.host,
          port: mailConfig.transport.port,
          user: mailConfig.transport.auth.user,
          from: mailConfig.defaults.from,
          hasPassword: !!mailConfig.transport.auth.pass,
          environment: configService.get('NODE_ENV'),
          isRailway: !!process.env.RAILWAY_ENVIRONMENT,
        });

        // Log Redis configuration for Bull queue
        console.log('🔧 Redis Config for Bull:', {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          hasPassword: !!configService.get('redis.password'),
        });

        return mailConfig;
      },
      inject: [ConfigService],
    }),

    // Application Modules
    CommonModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    ProjectsModule,
    AssetsModule,
    ReportsModule,
    EmailModule,
    AiModule,
  ],
})
export class AppModule {}
