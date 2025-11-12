import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IEmailProvider, EmailOptions, EmailResponse } from '../interfaces/email-provider.interface';

@Injectable()
export class ResendEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('mail.resendApiKey');

    if (!apiKey) {
      this.logger.warn('Resend API key not found in configuration');
      throw new Error('Resend API key is required when using Resend email provider');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('mail.from', 'noreply@4ami.com');
    this.logger.log('Resend email provider initialized');
  }

  async sendMail(options: EmailOptions): Promise<EmailResponse> {
    try {
      this.logger.log(`Sending email via Resend to: ${options.to}`);

      // Prepare attachments in Resend format (requires base64 encoded content)
      const attachments = options.attachments?.map(att => {
        const buffer = att.content instanceof Buffer ? att.content : Buffer.from(att.content);
        return {
          filename: att.filename,
          content: buffer, // Resend SDK handles Buffer to base64 conversion internally
        };
      });

      // Log attachment details for debugging
      if (attachments && attachments.length > 0) {
        const totalSize = attachments.reduce((sum, att) => sum + att.content.length, 0);
        this.logger.log(`Sending ${attachments.length} attachment(s), total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

        // Check Resend's 40MB limit
        if (totalSize > 40 * 1024 * 1024) {
          this.logger.error(`Total attachment size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds Resend's 40MB limit`);
          return {
            success: false,
            error: 'Total attachment size exceeds 40MB limit',
          };
        }
      }

      const { data, error } = await this.resend.emails.send({
        from: options.from || this.fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments,
      });

      if (error) {
        this.logger.error(`Failed to send email via Resend: ${error.message}`);
        this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
        this.logger.error(`Recipients: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
        this.logger.error(`Attachments: ${attachments?.length || 0} files`);
        return {
          success: false,
          error: error.message,
        };
      }

      this.logger.log(`Email sent successfully via Resend. Message ID: ${data.id}`);
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      this.logger.error(`Error sending email via Resend: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
