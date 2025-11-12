import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendInvitationDto } from './dto/send-invitation.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Send email' })
  @ApiResponse({ status: 201, description: 'Email queued for sending' })
  sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.emailService.sendEmail(sendEmailDto);
  }

  @Post('invitation')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Send user invitation email' })
  @ApiResponse({ status: 201, description: 'Invitation email queued for sending' })
  sendInvitation(@Body() sendInvitationDto: SendInvitationDto) {
    return this.emailService.sendInvitation(sendInvitationDto);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test email service' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async testEmail() {
    try {
      const result = await this.emailService.sendEmail({
        to: 'teamblinto@gmail.com',
        subject: 'Test Email from 4AMI Backend',
        text: 'This is a test email to verify email service is working.',
        html: '<h1>Test Email</h1><p>This is a test email to verify email service is working.</p>',
      });
      return { success: true, message: 'Test email queued successfully', result };
    } catch (error) {
      return { success: false, message: 'Test email failed', error: error.message };
    }
  }
}
