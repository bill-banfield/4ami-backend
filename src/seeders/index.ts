import { DataSource } from 'typeorm';
import { TestUsersSeeder } from './test-users.seeder';

export class Seeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      // Run test users seeder (includes admin, owner, and customer)
      const testUsersSeeder = new TestUsersSeeder(this.dataSource);
      await testUsersSeeder.seed();

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    console.log('🧹 Clearing seeded data...');

    try {
      // Clear test users seeder
      const testUsersSeeder = new TestUsersSeeder(this.dataSource);
      await testUsersSeeder.clear();

      console.log('✅ Seeded data cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear seeded data:', error);
      throw error;
    }
  }
}
