import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class UserVerificationResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  title?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  phone?: string;

  @ApiProperty({ example: 'ABC Corporation', required: false })
  companyName?: string;

  @ApiProperty({ example: 'How did you hear about us', required: false })
  source?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER_USER })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  @ApiProperty({ example: 'A7X3D' })
  emailVerificationToken: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  lastLoginAt?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;
}
