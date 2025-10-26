import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class AdminSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    // Check if admin already exists using raw SQL
    const existingAdmin = await this.dataSource.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@4ami.com']
    );

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash the password manually to avoid double hashing
    const hashedPassword = await bcrypt.hash('Admin@123456', 12);

    // Create admin user using raw SQL to bypass @BeforeInsert hook
    await this.dataSource.query(`
      INSERT INTO users (
        id, email, password, "firstName", "lastName", phone, role, 
        "isActive", "isEmailVerified", "emailVerificationToken", 
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
    `, [
      'admin@4ami.com',
      hashedPassword,
      'System',
      'Administrator',
      '+1234567890',
      'ADMIN',
      true,
      true,
      null
    ]);

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@4ami.com');
    console.log('🔑 Password: Admin@123456');
  }

  async clear(): Promise<void> {
    const result = await this.dataSource.query(
      'DELETE FROM users WHERE email = $1',
      ['admin@4ami.com']
    );

    if (result[1] > 0) {
      console.log('🗑️ Admin user removed');
    } else {
      console.log('ℹ️ Admin user not found');
    }
  }
}
