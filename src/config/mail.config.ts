import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  provider: process.env.EMAIL_PROVIDER || 'smtp', // 'smtp' or 'resend'
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT, 10) || 587,
  user: process.env.MAIL_USER || '',
  pass: process.env.MAIL_PASS || '',
  from: process.env.MAIL_FROM || 'noreply@4ami.com',
  resendApiKey: process.env.RESEND_API_KEY || '',
}));
