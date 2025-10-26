import { DataSource } from 'typeorm';
import { Seeder } from './index';

async function runSeeder() {
  // Support for Railway DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  
  const dataSource = new DataSource(
    databaseUrl ? {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    } : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || '4ami_user',
      password: process.env.DB_PASSWORD || '4ami_password',
      database: process.env.DB_DATABASE || '4ami_db',
      entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
    }
  );

  try {
    await dataSource.initialize();
    console.log('📊 Database connection established');

    const seeder = new Seeder(dataSource);
    
    const command = process.argv[2];
    
    if (command === 'clear') {
      await seeder.clear();
    } else {
      await seeder.run();
    }

  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

runSeeder();
