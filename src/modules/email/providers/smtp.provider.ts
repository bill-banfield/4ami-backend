import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IEmailProvider, EmailOptions, EmailResponse } from '../interfaces/email-provider.interface';

@Injectable()
export class SmtpEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);

  constructor(private mailerService: MailerService) {
    this.logger.log('SMTP email provider initialized');
  }

  async sendMail(options: EmailOptions): Promise<EmailResponse> {
    try {
      this.logger.log(`Sending email via SMTP to: ${options.to}`);

      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        from: options.from,
      });

      this.logger.log(`Email sent successfully via SMTP to ${options.to}`);
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error sending email via SMTP: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
