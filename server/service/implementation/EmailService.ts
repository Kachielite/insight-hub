import { inject, injectable } from 'tsyringe';

import { Constants } from '@config/constants';
import EmailConfig from '@config/email';
import { IEmailService } from '@service/IEmailService';
import logger from '@utils/logger';

@injectable()
class EmailService implements IEmailService {
  private readonly senderEmail = Constants.NODE_MAIL_USER as string;
  constructor(@inject(EmailConfig) private readonly emailConfig: EmailConfig) {}

  async sendEmailProjectInvite(
    email: string,
    inviterName: string,
    projectName: string,
    inviteLink: string
  ): Promise<void> {
    const body = this.projectInviteEmailBody(
      inviterName,
      projectName,
      inviteLink
    );
    try {
      await this.sendMail(email, 'Project Invite', body);
    } catch (error) {
      logger.error('Error sending invite email:', error);
      throw new Error('Failed to send invite email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string
  ): Promise<void> {
    const subject = 'Reset Your Password';
    const html = this.resetPasswordLinkEmailBody(resetLink);

    try {
      await this.sendMail(email, subject, html);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    const transporter = await this.emailConfig.getTransporter();
    return await transporter.sendMail({
      from: this.senderEmail,
      to,
      subject,
      html,
    });
  }

  private resetPasswordLinkEmailBody(link: string): string {
    return `
              <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
                <h2 style="color: #333333;">Your One-Time Password (OTP)</h2>
                <p style="font-size: 16px; color: #555555;">
                  Hello,<br><br>
                  Use the link below to reset your password. This link is valid for the next <strong>15 minutes</strong> and should not be shared with anyone.
                </p>
                <div style="font-size: 18px; font-weight: bold; color: #2b6cb0; text-align: center;">
                  <a href="${link}" style="color: #2b6cb0; text-decoration: none;">Reset password link</a>
                </div>
                <p style="font-size: 16px; color: #555555;">
                  If you did not request this link, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 32px;">
                  &copy; ${new Date().getFullYear()} InsightHub App. All rights reserved.
                </p>
              </div>
        `;
  }

  private projectInviteEmailBody(
    inviterName: string,
    projectName: string,
    inviteLink: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
        <h2 style="color: #333333;">Project Invitation</h2>
        <p style="font-size: 16px; color: #555555;">
          Hello,<br><br>
          ${inviterName} has invited you to join the project <strong>${projectName}</strong>. To accept the invitation, please click the link below:
        </p>
        <div style="font-size: 18px; font-weight: bold; color: #2b6cb0; text-align: center;">
          <a href="${inviteLink}" style="color: #2b6cb0; text-decoration: none;">Accept invitation</a>
        </div>
        <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} InsightHub App. All rights reserved.
        </p>
      </div>
    `;
  }
}

export default EmailService;
