import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CustomerSignupDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'ABC Corporation', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'How did you hear about us', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.CUSTOMER_USER,
  })
  @IsEnum(UserRole, {
    message:
      'role must be one of the following values: ADMIN, CUSTOMER_ADMIN, CUSTOMER_USER',
  })
  role: UserRole;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description:
      'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Must match the password field',
  })
  @IsString()
  confirmPassword: string;

  @ApiProperty({
    example: 'A7X3D',
    description: 'Invitation code received via email',
  })
  @IsString()
  invitationCode: string;

  @ApiProperty({
    example: true,
    description: 'User must agree to terms and policies',
  })
  @IsString()
  agreeToTerms: string;
}
