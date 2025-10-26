import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class SendInvitationDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ABC Corporation' })
  @IsString()
  company: string;

  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    enum: UserRole, 
    enumName: 'UserRole',
    example: UserRole.CUSTOMER_USER
  })
  @IsEnum(UserRole, {
    message: 'role must be one of the following values: ADMIN, CUSTOMER_ADMIN, CUSTOMER_USER'
  })
  role: UserRole;

  @ApiProperty({ example: 'How did you hear about us' })
  @IsString()
  source: string;

  @ApiProperty({ example: 'A7X3D' })
  @IsString()
  invitationCode: string;
}
// Updated invitation fields - Wed Sep 10 11:15:49 AM +06 2025
