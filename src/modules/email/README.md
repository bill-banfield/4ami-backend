# Email Module - Configurable Email Provider

This module supports multiple email providers through a configurable approach. You can switch between different email providers by simply changing an environment variable.

## Supported Providers

- **SMTP** (Default) - Uses any SMTP server (Gmail, Mailtrap, etc.)
- **Resend** - Uses Resend's email API service

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Email Provider Selection
EMAIL_PROVIDER=smtp  # Options: 'smtp' or 'resend'

# SMTP Configuration (used when EMAIL_PROVIDER=smtp)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_password
MAIL_FROM=noreply@4ami.com

# Resend Configuration (used when EMAIL_PROVIDER=resend)
RESEND_API_KEY=re_your_resend_api_key
```

### Using SMTP Provider

1. Set `EMAIL_PROVIDER=smtp` in your `.env` file
2. Configure SMTP settings:
   ```bash
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your-app-password
   MAIL_FROM=noreply@4ami.com
   ```

### Using Resend Provider

1. Get an API key from [Resend](https://resend.com/api-keys)
2. Set `EMAIL_PROVIDER=resend` in your `.env` file
3. Add your Resend API key:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   MAIL_FROM=noreply@yourdomain.com
   ```

**Important:** When using Resend, make sure your `MAIL_FROM` email domain is verified in your Resend account.

## Architecture

The email module uses a factory pattern to select the appropriate provider:

```
EmailModule
  └── EmailProviderFactory
       ├── SmtpEmailProvider (wraps @nestjs-modules/mailer)
       └── ResendEmailProvider (uses resend SDK)
```

### Files Structure

- `interfaces/email-provider.interface.ts` - Common interface for all email providers
- `providers/smtp.provider.ts` - SMTP email provider implementation
- `providers/resend.provider.ts` - Resend email provider implementation
- `providers/email-provider.factory.ts` - Factory to select and initialize the provider
- `processors/email.processor.ts` - Bull queue processor that uses the factory

## Usage in Code

The email service and processor remain unchanged. All emails are sent through the configured provider automatically:

```typescript
// In your service
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to 4AMI</h1>',
});
```

The system will automatically use the configured provider based on `EMAIL_PROVIDER` environment variable.

## Switching Providers

To switch providers:

1. Update `EMAIL_PROVIDER` in `.env`
2. Ensure the corresponding provider configuration is set
3. Restart your application

No code changes required!

## Development vs Production

### Development (Mailtrap)
```bash
EMAIL_PROVIDER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_pass
```

### Production (Resend)
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_production_key
MAIL_FROM=noreply@yourdomain.com
```

## Error Handling

Both providers implement the same error handling interface. Failed emails will:
- Return `{ success: false, error: 'error message' }`
- Be logged with appropriate error details
- Trigger Bull queue retry mechanism

## Adding New Providers

To add a new email provider:

1. Create a new provider class implementing `IEmailProvider`
2. Add the provider to `EmailProviderType` enum
3. Update `EmailProviderFactory` to handle the new provider
4. Add configuration to `mail.config.ts`
