export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  from?: string;
  attachments?: EmailAttachment[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  sendMail(options: EmailOptions): Promise<EmailResponse>;
}

export enum EmailProviderType {
  SMTP = 'smtp',
  RESEND = 'resend',
}
