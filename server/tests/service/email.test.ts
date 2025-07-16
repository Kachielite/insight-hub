import { container } from 'tsyringe';

import EmailConfig from '@config/email';
import EmailService from '@service/implementation/EmailService';

// Mock the Constants to control the sender email
jest.mock('@config/constants', () => ({
  Constants: {
    NODE_MAIL_USER: 'test-sender@example.com',
  },
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;
  let mockEmailConfig: any;

  beforeAll(() => {
    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    // Create mock EmailConfig
    mockEmailConfig = {
      getTransporter: jest.fn().mockResolvedValue(mockTransporter),
    };

    const testContainer = container.createChildContainer();
    testContainer.registerInstance(EmailConfig, mockEmailConfig);
    emailService = testContainer.resolve(EmailService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const email = 'IvK4X@example.com';
      const resetLink = 'https://localhost:3000/reset-password-link';

      await emailService.sendPasswordResetEmail(email, resetLink);

      // Verify that getTransporter was called
      expect(mockEmailConfig.getTransporter).toHaveBeenCalled();

      // Verify that sendMail was called with correct parameters
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test-sender@example.com', // This comes from mocked Constants
        to: email,
        subject: 'Reset Your Password',
        html: expect.any(String),
      });
    });

    it('should throw an error when email sending fails', async () => {
      const email = 'test@example.com';
      const resetLink = 'https://localhost:3000/reset-password-link';

      // Mock sendMail to reject
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      await expect(
        emailService.sendPasswordResetEmail(email, resetLink)
      ).rejects.toThrow('Failed to send password reset email');
    });
  });

  describe('sendEmailProjectInvite', () => {
    it('should send a project invitation email with correct parameters', async () => {
      const email = 'invitee@example.com';
      const inviterName = 'John Doe';
      const projectName = 'Test Project';
      const inviteLink = 'https://localhost:3000/invite/abc123';

      await emailService.sendEmailProjectInvite(
        email,
        inviterName,
        projectName,
        inviteLink
      );

      // Verify that getTransporter was called
      expect(mockEmailConfig.getTransporter).toHaveBeenCalled();

      // Verify that sendMail was called with correct parameters
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test-sender@example.com',
        to: email,
        subject: 'Project Invite',
        html: expect.any(String),
      });

      // Verify the HTML content contains the expected information
      const htmlContent = mockTransporter.sendMail.mock.calls[0][0].html;
      expect(htmlContent).toContain(inviterName);
      expect(htmlContent).toContain(projectName);
      expect(htmlContent).toContain(inviteLink);
    });

    it('should throw an error when project invite email sending fails', async () => {
      const email = 'invitee@example.com';
      const inviterName = 'John Doe';
      const projectName = 'Test Project';
      const inviteLink = 'https://localhost:3000/invite/abc123';

      // Mock sendMail to reject
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      await expect(
        emailService.sendEmailProjectInvite(
          email,
          inviterName,
          projectName,
          inviteLink
        )
      ).rejects.toThrow('Failed to send invite email');
    });
  });
});
