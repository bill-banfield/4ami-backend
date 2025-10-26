import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class SignInUserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User job title', required: false })
  title?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'User company', required: false })
  company?: string;

  @ApiProperty({ description: 'User source/registration method', required: false })
  source?: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Whether user account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether user email is verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'User full name (computed)' })
  fullName: string;
}

export class SignInResponseDto {
  @ApiProperty({ description: 'User information', type: SignInUserDto })
  user: SignInUserDto;

  @ApiProperty({ description: 'JWT access token' })
  token: string;
}
