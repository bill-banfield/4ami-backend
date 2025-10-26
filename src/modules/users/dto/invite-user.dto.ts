import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class InviteUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ 
    enum: UserRole, 
    enumName: 'UserRole',
    example: UserRole.CUSTOMER_ADMIN
  })
  @IsEnum(UserRole, {
    message: 'role must be one of the following values: ADMIN, CUSTOMER_ADMIN, CUSTOMER_USER'
  })
  role: UserRole;

  @ApiProperty({ example: 'A7X3D' })
  @IsString()
  invitationCode: string;

  @ApiProperty({ example: 'ABC Corporation' })
  @IsString()
  company: string;

  @ApiProperty({ example: 'How did you hear about us' })
  @IsString()
  source: string;
}
