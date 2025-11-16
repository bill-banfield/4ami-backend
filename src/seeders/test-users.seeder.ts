import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class TestUsersSeeder {
  constructor(private dataSource: DataSource) {}

  private testUsers = [
    {
      email: 'admin@4ami.com',
      password: 'Admin@123456',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
      role: 'ADMIN',
    },
    {
      email: 'bill@4ami.com',
      password: 'Owner@123456',
      firstName: 'Bill',
      lastName: 'Banfield',
      phone: '+1555123456',
      role: 'ADMIN',
    },
    {
      email: 'customer@4ami.com',
      password: 'Customer@123456',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+1555987654',
      role: 'CUSTOMER_ADMIN',
    },
  ];

  async seed(): Promise<void> {
    console.log('🌱 Seeding test users...\n');

    for (const user of this.testUsers) {
      // Check if user already exists
      const existing = await this.dataSource.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email],
      );

      if (existing.length > 0) {
        console.log(`⏭️  User ${user.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 12);

      // Create user using raw SQL
      await this.dataSource.query(
        `
        INSERT INTO users (
          id, email, password, "firstName", "lastName", phone, role,
          "isActive", "isEmailVerified", "emailVerificationToken",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
      `,
        [
          user.email,
          hashedPassword,
          user.firstName,
          user.lastName,
          user.phone,
          user.role,
          true,
          true,
          null,
        ],
      );

      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMIN (System):');
    console.log('   Email:    admin@4ami.com');
    console.log('   Password: Admin@123456');
    console.log('');
    console.log('👤 OWNER (Bill Banfield):');
    console.log('   Email:    bill@4ami.com');
    console.log('   Password: Owner@123456');
    console.log('');
    console.log('👤 CUSTOMER ADMIN:');
    console.log('   Email:    customer@4ami.com');
    console.log('   Password: Customer@123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  async clear(): Promise<void> {
    console.log('🗑️  Clearing test users...\n');

    for (const user of this.testUsers) {
      const result = await this.dataSource.query(
        'DELETE FROM users WHERE email = $1',
        [user.email],
      );

      if (result[1] > 0) {
        console.log(`✅ Removed user: ${user.email}`);
      }
    }

    console.log('\n✅ Test users cleared\n');
  }
}
