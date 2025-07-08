import EmailConfig from '@config/email';
import EmailService from '@service/implementation/EmailService';
import { container } from 'tsyringe';

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
});
