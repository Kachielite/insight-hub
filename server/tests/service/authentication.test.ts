import { container } from 'tsyringe';
import { Request } from 'express';
import AuthenticationService from '@service/implementation/AuthenticationService';
import UserRepository from '@repository/implementation/UserRepository';
import JwtService from '@service/implementation/JwtService';
import PasswordEncoderService from '@service/implementation/PasswordEncoderService';
import EmailService from '@service/implementation/EmailService';
import PasswordResetTokenRepository from '@repository/implementation/PasswordResetTokenRepository';
import {
  AuthenticationDTO,
  AuthTokenDTO,
  PasswordResetDTO,
  RegistrationDTO,
} from '@dto/AuthenticationDTO';
import {
  BadRequestException,
  InternalServerException,
  NotAuthorizedException,
  ResourceNotFoundException,
} from '@/exception';

// Mock dependencies with complete interfaces
const mockUserRepository = {
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(), // Added missing method
};

const mockJwtService = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  refreshAccessToken: jest.fn(), // Added missing method
  SECRET_KEY: 'test-secret',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  userRepository: mockUserRepository,
};

const mockPasswordEncoderService = {
  comparePasswords: jest.fn(),
  hashPassword: jest.fn(),
};

const mockEmailService = {
  sendPasswordResetEmail: jest.fn(),
  senderEmail: 'test@example.com',
  emailConfig: {},
  sendMail: jest.fn(),
  resetPasswordLinkEmailBody: jest.fn(),
};

const mockPasswordResetTokenRepository = {
  create: jest.fn(),
  findByToken: jest.fn(), // Added missing method
  deleteByTokenID: jest.fn(), // Added missing method
};

// Mock TokenGenerator
jest.mock('@utils/TokenGenerator', () => ({
  generateToken: jest.fn(() => 'mock-reset-token'),
}));

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;

  beforeAll(() => {
    const testContainer = container.createChildContainer();

    // Register mocks using registerInstance with type assertion to bypass strict typing
    testContainer.registerInstance(UserRepository, mockUserRepository as any);
    testContainer.registerInstance(JwtService, mockJwtService as any);
    testContainer.registerInstance(
      PasswordEncoderService,
      mockPasswordEncoderService as any
    );
    testContainer.registerInstance(EmailService, mockEmailService as any);
    testContainer.registerInstance(
      PasswordResetTokenRepository,
      mockPasswordResetTokenRepository as any
    );

    authenticationService = testContainer.resolve(AuthenticationService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData: AuthenticationDTO = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
    };

    it('should login successfully with valid credentials', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockPasswordEncoderService.comparePasswords.mockResolvedValue(true);
      mockJwtService.generateToken
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authenticationService.login(loginData);

      expect(result.code).toBe(200);
      expect(result.message).toBe('Login successful');
      expect(result.data).toEqual(
        new AuthTokenDTO('access-token', 'refresh-token')
      );
      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(
        loginData.email
      );
      expect(mockPasswordEncoderService.comparePasswords).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      );
      expect(mockJwtService.generateToken).toHaveBeenCalledTimes(2);
    });

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await expect(authenticationService.login(loginData)).rejects.toThrow(
        new ResourceNotFoundException(
          `User with email ${loginData.email} does not exist`
        )
      );
    });

    it('should throw NotAuthorizedException with invalid password', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockPasswordEncoderService.comparePasswords.mockResolvedValue(false);

      await expect(authenticationService.login(loginData)).rejects.toThrow(
        new NotAuthorizedException('Invalid email or password')
      );
    });

    it('should throw InternalServerException for unexpected errors', async () => {
      mockUserRepository.findUserByEmail.mockRejectedValue(
        new Error('Database error')
      );

      await expect(authenticationService.login(loginData)).rejects.toThrow(
        new InternalServerException('Internal server error during login')
      );
    });
  });

  describe('register', () => {
    const registerData: RegistrationDTO = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    const mockCreatedUser = {
      id: 'user-456',
      email: 'newuser@example.com',
      name: 'New User',
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);
      mockPasswordEncoderService.hashPassword.mockResolvedValue(
        'hashed-password'
      );
      mockUserRepository.createUser.mockResolvedValue(mockCreatedUser);
      mockJwtService.generateToken
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authenticationService.register(registerData);

      expect(result.code).toBe(201);
      expect(result.message).toBe('User registered successfully');
      expect(result.data).toEqual(
        new AuthTokenDTO('access-token', 'refresh-token')
      );
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        email: registerData.email,
        password: 'hashed-password',
        name: registerData.name,
      });
    });

    it('should throw BadRequestException when user already exists', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue({
        id: 'existing-user',
      });

      await expect(
        authenticationService.register(registerData)
      ).rejects.toThrow(
        new BadRequestException(
          `User with email ${registerData.email} already exists`
        )
      );
    });

    it('should throw InternalServerException for unexpected errors', async () => {
      mockUserRepository.findUserByEmail.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        authenticationService.register(registerData)
      ).rejects.toThrow(
        new InternalServerException('Internal server error during registration')
      );
    });
  });

  describe('resetPasswordLink', () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    const mockResetToken = {
      token: 'mock-reset-token',
      userId: 'user-123',
      expiresAt: new Date(),
    };

    it('should send reset password link successfully', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockPasswordResetTokenRepository.create.mockResolvedValue(mockResetToken);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await authenticationService.resetPasswordLink(email);

      expect(result.code).toBe(200);
      expect(result.message).toBe('Reset password link sent successfully');
      expect(result.data).toBe(
        `http://localhost:3000/reset-password?token=${mockResetToken.token}`
      );
      expect(mockPasswordResetTokenRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        token: 'mock-reset-token',
        expiresAt: expect.any(Date),
      });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        email,
        `http://localhost:3000/reset-password?token=${mockResetToken.token}`
      );
    });

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        authenticationService.resetPasswordLink(email)
      ).rejects.toThrow(
        new ResourceNotFoundException(`User with email ${email} does not exist`)
      );
    });

    it('should throw InternalServerException for unexpected errors', async () => {
      mockUserRepository.findUserByEmail.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        authenticationService.resetPasswordLink(email)
      ).rejects.toThrow(
        new InternalServerException(
          'Internal server error during reset password link request'
        )
      );
    });
  });

  describe('resetPassword', () => {
    const resetData: PasswordResetDTO = {
      email: 'test@example.com',
      newPassword: 'newpassword123',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    it('should reset password successfully', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockPasswordEncoderService.hashPassword.mockResolvedValue(
        'new-hashed-password'
      );
      mockUserRepository.updateUser.mockResolvedValue(undefined);

      const result = await authenticationService.resetPassword(resetData);

      expect(result.code).toBe(200);
      expect(result.message).toBe('Password reset successfully');
      expect(result.data).toBe('Password has been reset successfully');
      expect(mockPasswordEncoderService.hashPassword).toHaveBeenCalledWith(
        resetData.newPassword
      );
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(mockUser.id, {
        password: 'new-hashed-password',
      });
    });

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        authenticationService.resetPassword(resetData)
      ).rejects.toThrow(
        new ResourceNotFoundException(
          `User with email ${resetData.email} does not exist`
        )
      );
    });

    it('should throw InternalServerException for unexpected errors', async () => {
      mockUserRepository.findUserByEmail.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        authenticationService.resetPassword(resetData)
      ).rejects.toThrow(
        new InternalServerException(
          'Internal server error during password reset'
        )
      );
    });
  });

  describe('refreshToken', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    const mockPayload = {
      userId: 'user-123',
      type: 'refresh',
    };

    it('should refresh token successfully', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-refresh-token',
        },
      } as Request;

      mockJwtService.verifyToken.mockResolvedValue(mockPayload);
      mockUserRepository.findUserById.mockResolvedValue(mockUser);
      mockJwtService.generateToken.mockResolvedValue('new-access-token');

      const result = await authenticationService.refreshToken(mockRequest);

      expect(result.code).toBe(200);
      expect(result.message).toBe('Token refreshed successfully');
      expect(result.data).toEqual(
        new AuthTokenDTO('new-access-token', 'valid-refresh-token')
      );
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith(
        'valid-refresh-token'
      );
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(
        mockPayload.userId
      );
    });

    it('should throw BadRequestException when no refresh token provided', async () => {
      const mockRequest = {
        headers: {},
      } as Request;

      await expect(
        authenticationService.refreshToken(mockRequest)
      ).rejects.toThrow(new BadRequestException('Refresh token is required'));
    });

    it('should throw NotAuthorizedException with invalid refresh token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-refresh-token',
        },
      } as Request;

      mockJwtService.verifyToken.mockResolvedValue(null);

      await expect(
        authenticationService.refreshToken(mockRequest)
      ).rejects.toThrow(
        new NotAuthorizedException('Invalid or expired refresh token')
      );
    });

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-refresh-token',
        },
      } as Request;

      mockJwtService.verifyToken.mockResolvedValue(mockPayload);
      mockUserRepository.findUserById.mockResolvedValue(null);

      await expect(
        authenticationService.refreshToken(mockRequest)
      ).rejects.toThrow(new ResourceNotFoundException('User does not exist'));
    });

    it('should throw InternalServerException for unexpected errors', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-refresh-token',
        },
      } as Request;

      mockJwtService.verifyToken.mockRejectedValue(new Error('JWT error'));

      await expect(
        authenticationService.refreshToken(mockRequest)
      ).rejects.toThrow(
        new InternalServerException(
          'Internal server error during token refresh'
        )
      );
    });
  });
});
