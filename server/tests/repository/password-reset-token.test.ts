import { container } from 'tsyringe';

import mockPrisma from '@config/db';
import PasswordResetTokenRepository from '@repository/implementation/PasswordResetTokenRepository';
import { IPasswordResetTokenRepository } from '@repository/IPasswordResetTokenRepository';

// Mock the Prisma client with properly typed Jest mocks
jest.mock('@config/db', () => ({
  passwordResetToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

// Create a properly typed mock object
const mockPrismaClient = mockPrisma as {
  passwordResetToken: {
    create: jest.MockedFunction<any>;
    findFirst: jest.MockedFunction<any>;
    findUnique: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  };
};

describe('PasswordResetTokenRepository', () => {
  let passwordResetTokenRepository: IPasswordResetTokenRepository;

  beforeAll(() => {
    const testContainer = container.createChildContainer();
    passwordResetTokenRepository = testContainer.resolve(
      PasswordResetTokenRepository
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTokenData = {
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-09T12:00:00Z'),
    };

    const mockCreatedToken = {
      id: 'token-id-123',
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-09T12:00:00Z'),
      createdAt: new Date('2025-07-08T12:00:00Z'),
    };

    it('should create a password reset token successfully', async () => {
      mockPrismaClient.passwordResetToken.create.mockResolvedValue(
        mockCreatedToken
      );

      const result = await passwordResetTokenRepository.create(createTokenData);

      expect(mockPrismaClient.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: createTokenData.userId,
          token: createTokenData.token,
          expiresAt: createTokenData.expiresAt,
        },
      });
      expect(result).toEqual(mockCreatedToken);
    });

    it('should handle create errors', async () => {
      const mockError = new Error('Database error');
      mockPrismaClient.passwordResetToken.create.mockRejectedValue(mockError);

      await expect(
        passwordResetTokenRepository.create(createTokenData)
      ).rejects.toThrow('Database error');
    });
  });

  describe('findByToken', () => {
    const token = 'reset-token-123';
    const mockFoundToken = {
      id: 'token-id-123',
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-09T12:00:00Z'),
      createdAt: new Date('2025-07-08T12:00:00Z'),
    };

    it('should find a password reset token by token successfully', async () => {
      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(
        mockFoundToken
      );

      const result = await passwordResetTokenRepository.findByToken(token);

      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledWith({
        where: { token },
      });
      expect(result).toEqual(mockFoundToken);
    });

    it('should return null when token is not found', async () => {
      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(null);

      const result =
        await passwordResetTokenRepository.findByToken('non-existent-token');
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    const userId = 1;
    const mockFoundToken = {
      id: 'token-id-123',
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-09T12:00:00Z'),
      createdAt: new Date('2025-07-08T12:00:00Z'),
    };

    it('should find a password reset token by userId successfully', async () => {
      mockPrismaClient.passwordResetToken.findUnique.mockResolvedValue(
        mockFoundToken
      );

      const result = await passwordResetTokenRepository.findByUserId(userId);

      expect(
        mockPrismaClient.passwordResetToken.findUnique
      ).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockFoundToken);
    });

    it('should return null when user token is not found', async () => {
      mockPrismaClient.passwordResetToken.findUnique.mockResolvedValue(null);

      const result = await passwordResetTokenRepository.findByUserId(userId);
      expect(result).toBeNull();
    });
  });

  describe('deleteByTokenID', () => {
    const tokenId = 'token-id-123';
    const mockDeletedToken = {
      id: 'token-id-123',
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-09T12:00:00Z'),
      createdAt: new Date('2025-07-08T12:00:00Z'),
    };

    it('should delete a password reset token by ID successfully', async () => {
      mockPrismaClient.passwordResetToken.delete.mockResolvedValue(
        mockDeletedToken
      );

      const result =
        await passwordResetTokenRepository.deleteByTokenID(tokenId);

      expect(mockPrismaClient.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: tokenId },
      });
      expect(result).toEqual(mockDeletedToken);
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('Token not found for deletion');
      mockPrismaClient.passwordResetToken.delete.mockRejectedValue(mockError);

      await expect(
        passwordResetTokenRepository.deleteByTokenID(tokenId)
      ).rejects.toThrow('Token not found for deletion');
    });
  });
});
