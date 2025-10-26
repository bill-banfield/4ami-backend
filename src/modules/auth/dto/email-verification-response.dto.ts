import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class EmailVerificationResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    title?: string;
    phone?: string;
    companyName?: string;
    source?: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerificationToken: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    fullName: string;
  };
}
