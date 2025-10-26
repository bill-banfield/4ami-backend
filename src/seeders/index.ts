import { DataSource } from 'typeorm';
import { AdminSeeder } from './admin.seeder';

export class Seeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      // Run admin seeder
      const adminSeeder = new AdminSeeder(this.dataSource);
      await adminSeeder.seed();

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    console.log('🧹 Clearing seeded data...');

    try {
      // Clear admin seeder
      const adminSeeder = new AdminSeeder(this.dataSource);
      await adminSeeder.clear();

      console.log('✅ Seeded data cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear seeded data:', error);
      throw error;
    }
  }
}
