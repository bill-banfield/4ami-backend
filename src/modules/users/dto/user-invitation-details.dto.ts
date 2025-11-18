import { UserRole } from '@/common/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserInvitationDetailsDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  title?: string;

  @ApiProperty({ example: 'ABC Corporation', required: false })
  companyName?: string;

  @ApiProperty({ example: 'How did you hear about us', required: false })
  source?: string;
  
  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER_USER })
  role: UserRole;
}

