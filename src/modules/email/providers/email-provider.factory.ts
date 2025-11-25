import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import {
  IEmailProvider,
  EmailProviderType,
} from '../interfaces/email-provider.interface';
import { ResendEmailProvider } from './resend.provider';
import { SmtpEmailProvider } from './smtp.provider';

@Injectable()
export class EmailProviderFactory {
  private readonly logger = new Logger(EmailProviderFactory.name);
  private emailProvider: IEmailProvider;

  constructor(
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {
    this.initializeProvider();
  }

  private initializeProvider(): void {
    const provider = this.configService.get<string>('mail.provider', 'smtp');

    this.logger.log(`Initializing email provider: ${provider}`);

    switch (provider) {
      case EmailProviderType.RESEND:
        this.emailProvider = new ResendEmailProvider(this.configService);
        break;
      case EmailProviderType.SMTP:
      default:
        this.emailProvider = new SmtpEmailProvider(this.mailerService);
        break;
    }

    this.logger.log(`Email provider ${provider} initialized successfully`);
  }

  getProvider(): IEmailProvider {
    return this.emailProvider;
  }
}
