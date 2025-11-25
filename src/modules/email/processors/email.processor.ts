import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { Company } from '../../../entities/company.entity';
import { User } from '../../../entities/user.entity';
import { EmailProviderFactory } from '../providers/email-provider.factory';
import { ProjectExcelGenerator } from '../utils/project-excel-generator';
import * as fs from 'fs';

@Processor('email')
@Injectable()
export class EmailProcessor {
  constructor(private emailProviderFactory: EmailProviderFactory) {}

  @Process('send-email')
  async handleSendEmail(
    job: Job<{
      to: string;
      subject: string;
      text: string;
      html?: string;
      cc?: string[];
      bcc?: string[];
    }>,
  ) {
    const { to, subject, text, html, cc, bcc } = job.data;

    try {
      console.log(`📧 Attempting to send email to: ${to}`);
      console.log(`📧 Subject: ${subject}`);

      const provider = this.emailProviderFactory.getProvider();
      const result = await provider.sendMail({
        to,
        subject,
        text,
        html,
        cc,
        bcc,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      console.log(`✅ Email sent successfully to ${to}`);
      return { success: true, to, subject };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      console.error(`❌ Error details:`, {
        message: error.message,
        code: error.code,
        response: error.response,
      });
      throw error;
    }
  }

  @Process('send-invitation')
  async handleSendInvitation(
    job: Job<{
      firstName: string;
      lastName: string;
      company: string;
      email: string;
      role: string;
      source: string;
      invitationCode: string;
    }>,
  ) {
    const { firstName, lastName, company, email, role, invitationCode } =
      job.data;

    try {
      const invitationUrl = `${process.env.FRONTEND_URL || 'https://4ami-mu.vercel.app'}/customer-signup?token=${invitationCode}&role=${role}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to 4AMI Platform</h2>
          <p>Hello ${firstName} ${lastName},</p>
          <p>You have been invited to join the 4AMI Platform as a ${role}.</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Invitation Code:</strong> ${invitationCode}</p>
          <p>Click the link below to complete your registration:</p>
          <a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Registration</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${invitationUrl}</p>
          <p>Best regards,<br>The 4AMI Team</p>
        </div>
      `;

      const provider = this.emailProviderFactory.getProvider();
      const result = await provider.sendMail({
        to: email,
        subject: 'Invitation to Join 4AMI Platform',
        html,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send invitation email');
      }

      console.log(`Invitation email sent successfully to ${email}`);
      return { success: true, email, role };
    } catch (error) {
      console.error(`Failed to send invitation email to ${email}:`, error);
      throw error;
    }
  }

  @Process('send-password-reset')
  async handleSendPasswordReset(
    job: Job<{
      email: string;
      resetToken: string;
    }>,
  ) {
    const { email, resetToken } = job.data;

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password for your 4AMI Platform account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The 4AMI Team</p>
        </div>
      `;

      const provider = this.emailProviderFactory.getProvider();
      const result = await provider.sendMail({
        to: email,
        subject: 'Password Reset Request - 4AMI Platform',
        html,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send password reset email');
      }

      console.log(`Password reset email sent successfully to ${email}`);
      return { success: true, email };
    } catch (error) {
      console.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  @Process('send-email-verification')
  async handleSendEmailVerification(
    job: Job<{
      email: string;
      verificationToken: string;
    }>,
  ) {
    const { email, verificationToken } = job.data;

    try {
      const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/auth/verify-email/${verificationToken}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering with 4AMI Platform!</p>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>Best regards,<br>The 4AMI Team</p>
        </div>
      `;

      const provider = this.emailProviderFactory.getProvider();
      const result = await provider.sendMail({
        to: email,
        subject: 'Verify Your Email - 4AMI Platform',
        html,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email verification');
      }

      console.log(`Email verification sent successfully to ${email}`);
      return { success: true, email };
    } catch (error) {
      console.error(`Failed to send email verification to ${email}:`, error);
      throw error;
    }
  }

  @Process('send-company-registration-notification')
  async handleSendCompanyRegistrationNotification(
    job: Job<{
      company: Company;
      customerAdmin: User;
    }>,
  ) {
    const { company, customerAdmin } = job.data;

    try {
      // Get system admin email from environment or use default
      const systemAdminEmail =
        process.env.SYSTEM_ADMIN_EMAIL || 'admin@4ami.com';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Company Registration</h2>
          <p>A new company has been registered on the 4AMI Platform.</p>

          <h3>Company Details:</h3>
          <ul>
            <li><strong>Company Name:</strong> ${company.companyName}</li>
            <li><strong>Company Email:</strong> ${company.companyEmail}</li>
            <li><strong>EIN/TAX ID:</strong> ${company.einTaxId}</li>
            <li><strong>Phone:</strong> ${company.phone}</li>
            <li><strong>Mobile:</strong> ${company.mobile}</li>
            <li><strong>Address:</strong> ${company.address1}${company.address2 ? ', ' + company.address2 : ''}</li>
            <li><strong>City:</strong> ${company.city}</li>
            <li><strong>State:</strong> ${company.state}</li>
            <li><strong>ZIP:</strong> ${company.zip}</li>
            <li><strong>Country:</strong> ${company.country}</li>
            ${company.regionBranch ? `<li><strong>Region/Branch:</strong> ${company.regionBranch}</li>` : ''}
          </ul>

          <h3>Customer Admin Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${customerAdmin.firstName} ${customerAdmin.lastName}</li>
            <li><strong>Email:</strong> ${customerAdmin.email}</li>
            <li><strong>Title:</strong> ${customerAdmin.title || 'N/A'}</li>
            <li><strong>Phone:</strong> ${customerAdmin.phone || 'N/A'}</li>
            <li><strong>Role:</strong> ${customerAdmin.role}</li>
          </ul>

          <p>Best regards,<br>The 4AMI System</p>
        </div>
      `;

      const provider = this.emailProviderFactory.getProvider();
      const result = await provider.sendMail({
        to: systemAdminEmail,
        subject: `New Company Registration: ${company.companyName}`,
        html,
      });

      if (!result.success) {
        throw new Error(
          result.error || 'Failed to send company registration notification',
        );
      }

      console.log(
        `Company registration notification sent successfully to ${systemAdminEmail}`,
      );
      return { success: true, systemAdminEmail };
    } catch (error) {
      console.error(`Failed to send company registration notification:`, error);
      throw error;
    }
  }

  @Process('send-user-credentials')
  async handleSendUserCredentials(
    job: Job<{
      user: User;
      invitationCode: string;
    }>,
  ) {
    const { user, invitationCode } = job.data;

    try {
      const signupUrl = `${process.env.FRONTEND_URL || 'https://4ami-mu.vercel.app'}/customer-signup?token=${invitationCode}&role=${user.role}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to 4AMI Platform</h2>
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>Your account has been created on the 4AMI Platform. Please use the following information to complete your registration:</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Invitation Code:</strong> ${invitationCode}</p>
            <p><strong>Role:</strong> ${user.role}</p>
          </div>

          <p>Click the link below to set up your password and complete your registration:</p>
          <a href="${signupUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Registration</a>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${signupUrl}</p>

          <p>Best regards,<br>The 4AMI Team</p>
        </div>
      `;

      const provider = this.emailProviderFactory.getProvider();
      const result = await provider.sendMail({
        to: user.email,
        subject: 'Your 4AMI Platform Account - Complete Registration',
        html,
      });

      if (!result.success) {
        throw new Error(
          result.error || 'Failed to send user credentials email',
        );
      }

      console.log(`User credentials email sent successfully to ${user.email}`);
      return { success: true, email: user.email };
    } catch (error) {
      console.error(
        `Failed to send user credentials email to ${user.email}:`,
        error,
      );
      throw error;
    }
  }

  @Process('send-project-creation-notification')
  async handleSendProjectCreationNotification(
    job: Job<{
      project: any;
      creator: User;
      company: Company;
      recipients: string[];
      attachments?: any[];
    }>,
  ) {
    const {
      project,
      creator,
      company,
      recipients,
      attachments = [],
    } = job.data;

    try {
      const projectUrl = `${process.env.FRONTEND_URL || 'https://4ami-mu.vercel.app'}/projects/${project.id}`;

      // Build attachment info text for email
      let attachmentInfoHtml = '';
      if (attachments.length > 0) {
        attachmentInfoHtml = `
          <h3>Uploaded Attachments (${attachments.length}):</h3>
          <ul>
            ${attachments.map(att => `<li>${att.originalFileName} (${(att.fileSize / 1024).toFixed(2)} KB)</li>`).join('')}
          </ul>
        `;
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Project Created</h2>
          <p>A new project has been created on the 4AMI Platform.</p>

          <h3>Project Details:</h3>
          <ul>
            <li><strong>Project Number:</strong> ${project.projectNumber}</li>
            <li><strong>Project Name:</strong> ${project.name}</li>
            <li><strong>Project Type:</strong> ${project.projectType?.name || 'N/A'}</li>
            <li><strong>Status:</strong> ${project.status.toUpperCase()}</li>
            ${project.startDate ? `<li><strong>Start Date:</strong> ${new Date(project.startDate).toLocaleDateString()}</li>` : ''}
            ${project.description ? `<li><strong>Description:</strong> ${project.description}</li>` : ''}
          </ul>

          <h3>Company:</h3>
          <ul>
            <li><strong>Company Name:</strong> ${company.companyName}</li>
            <li><strong>Company Email:</strong> ${company.companyEmail}</li>
          </ul>

          <h3>Created By:</h3>
          <ul>
            <li><strong>Name:</strong> ${creator.firstName} ${creator.lastName}</li>
            <li><strong>Email:</strong> ${creator.email}</li>
            <li><strong>Role:</strong> ${creator.role}</li>
          </ul>

          ${attachmentInfoHtml}

          <p>Please find the complete project details in the attached Excel file${attachments.length > 0 ? ' along with all uploaded documents' : ''}.</p>

          <p>Click the link below to view the project:</p>
          <a href="${projectUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Project</a>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${projectUrl}</p>

          <p>Best regards,<br>The 4AMI System</p>
        </div>
      `;

      // Generate Excel attachment
      const excelBuffer = await ProjectExcelGenerator.generateProjectExcel(
        project,
        creator,
        company,
      );
      const excelFileName = `Project_${project.projectNumber}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Prepare email attachments array (Excel + uploaded files)
      const emailAttachments: any[] = [
        {
          filename: excelFileName,
          content: excelBuffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ];

      // Add uploaded file attachments if available

      for (const attachment of attachments) {
        try {
          console.log(
            `📄 Reading attachment: ${attachment.originalFileName} from ${attachment.filePath}`,
          );

          // Check if file exists
          const fileExists = await fs.promises
            .access(attachment.filePath, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);

          if (!fileExists) {
            console.error(`❌ File not found: ${attachment.filePath}`);
            continue;
          }

          // Read file from disk
          const fileBuffer = await fs.promises.readFile(attachment.filePath);
          console.log(
            `✅ Read ${attachment.originalFileName}: ${(fileBuffer.length / 1024).toFixed(2)} KB`,
          );

          emailAttachments.push({
            filename: attachment.originalFileName,
            content: fileBuffer,
            // Note: contentType is not needed for Resend, it will auto-detect
          });
        } catch (fileError) {
          console.error(
            `❌ Failed to read attachment file ${attachment.originalFileName}:`,
            fileError,
          );
          // Continue with other attachments even if one fails
        }
      }

      // Calculate total email size
      const totalSize = emailAttachments.reduce(
        (sum, att) => sum + att.content.length,
        0,
      );
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

      console.log(
        `📎 Prepared ${emailAttachments.length} attachments (1 Excel + ${attachments.length} uploaded files)`,
      );
      console.log(`📊 Total email size: ${totalSizeMB} MB`);

      // Resend has a 40MB limit
      if (totalSize > 40 * 1024 * 1024) {
        console.warn(
          `⚠️ WARNING: Total email size (${totalSizeMB} MB) exceeds Resend's 40MB limit!`,
        );
      }

      // Send to all recipients
      const provider = this.emailProviderFactory.getProvider();
      const emailPromises = recipients.map(recipientEmail =>
        provider.sendMail({
          to: recipientEmail,
          subject: `New Project Created: ${project.name} (${project.projectNumber})`,
          html,
          attachments: emailAttachments,
        }),
      );

      const results = await Promise.all(emailPromises);

      // Check if any emails failed
      const failedEmails = results.filter(result => !result.success);
      if (failedEmails.length > 0) {
        throw new Error(`Failed to send ${failedEmails.length} emails`);
      }

      console.log(
        `✅ Project creation notifications sent successfully to ${recipients.length} recipients with ${emailAttachments.length} attachment(s)`,
      );
      return {
        success: true,
        recipients,
        projectId: project.id,
        attachmentsCount: emailAttachments.length,
      };
    } catch (error) {
      console.error(`❌ Failed to send project creation notifications:`, error);
      throw error;
    }
  }
}
