import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.PGPORT, 10) || 5432,
  username: process.env.DB_USERNAME || process.env.PGUSER || '4ami_user',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '4ami_password',
  database: process.env.DB_DATABASE || process.env.PGDATABASE || '4ami_db',
  // Support for Railway DATABASE_URL
  url: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
}));
