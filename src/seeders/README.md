# Database Seeders

This directory contains database seeders for the 4AMI platform.

## Available Seeders

### Admin Seeder
Creates a default admin user for system administration.

**Admin Credentials:**
- Email: `admin@4ami.com`
- Password: `Admin@123456`
- Role: `admin`

## Usage

### Using npm scripts:
```bash
# Seed the database
npm run seed

# Clear seeded data
npm run seed:clear
```

### Using Makefile:
```bash
# Seed the database
make db-seed

# Clear seeded data
make db-seed-clear
```

### Using Docker:
```bash
# Seed the database (from inside container)
docker-compose exec app npm run seed

# Clear seeded data (from inside container)
docker-compose exec app npm run seed:clear
```

## How it works

1. The seeder connects to the database using the same configuration as the main application
2. It checks if the admin user already exists to prevent duplicates
3. Creates the admin user with hashed password and proper role
4. The password is automatically hashed by the User entity's `@BeforeInsert()` hook

## Security Notes

- The admin password is hashed using bcrypt with salt rounds of 12
- The admin user is created with `isActive: true` and `isEmailVerified: true`
- No email verification is required for the seeded admin user

## Adding New Seeders

To add a new seeder:

1. Create a new seeder class in this directory
2. Add it to the main `Seeder` class in `index.ts`
3. Update the README with the new seeder information
