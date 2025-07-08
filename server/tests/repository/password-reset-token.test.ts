import mockPrisma from '@config/db';
import PasswordResetTokenRepository from '@repository/implementation/PasswordResetTokenRepository';
import { IPasswordResetTokenRepository } from '@repository/IPasswordResetTokenRepository';
import { container } from 'tsyringe';
// Import the mocked module and cast it properly

// Mock the Prisma client with properly typed Jest mocks
jest.mock('@config/db', () => ({
  passwordResetToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

// Create a properly typed mock object
const mockPrismaClient = mockPrisma as {
  passwordResetToken: {
    create: jest.MockedFunction<any>;
    findFirst: jest.MockedFunction<any>;
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
    const createData = {
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-06T18:00:00.000Z'),
    };

    const mockCreatedToken = {
      id: 'token-id-123',
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-06T18:00:00.000Z'),
      used: false,
      createdAt: new Date('2025-07-05T18:00:00.000Z'),
    };

    it('should create a password reset token successfully', async () => {
      mockPrismaClient.passwordResetToken.create.mockResolvedValue(
        mockCreatedToken
      );

      const result = await passwordResetTokenRepository.create(createData);

      expect(result).toEqual(mockCreatedToken);
      expect(mockPrismaClient.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: createData.userId,
          token: createData.token,
          expiresAt: createData.expiresAt,
        },
      });
      expect(mockPrismaClient.passwordResetToken.create).toHaveBeenCalledTimes(
        1
      );
    });

    it('should handle database errors during creation', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaClient.passwordResetToken.create.mockRejectedValue(dbError);

      await expect(
        passwordResetTokenRepository.create(createData)
      ).rejects.toThrow('Database connection failed');
      expect(mockPrismaClient.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: createData.userId,
          token: createData.token,
          expiresAt: createData.expiresAt,
        },
      });
    });

    it('should create token with future expiration date', async () => {
      const futureDate = new Date('2025-12-31T23:59:59.000Z');
      const dataWithFutureDate = {
        ...createData,
        expiresAt: futureDate,
      };

      const expectedToken = {
        ...mockCreatedToken,
        expiresAt: futureDate,
      };

      mockPrismaClient.passwordResetToken.create.mockResolvedValue(
        expectedToken
      );

      const result =
        await passwordResetTokenRepository.create(dataWithFutureDate);

      expect(result.expiresAt).toEqual(futureDate);
      expect(mockPrismaClient.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: dataWithFutureDate.userId,
          token: dataWithFutureDate.token,
          expiresAt: futureDate,
        },
      });
    });
  });

  describe('findByToken', () => {
    const searchToken = 'reset-token-123';

    const mockFoundToken = {
      id: 'token-id-123',
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-06T18:00:00.000Z'),
    };

    it('should find a password reset token by token string', async () => {
      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(
        mockFoundToken
      );

      const result =
        await passwordResetTokenRepository.findByToken(searchToken);

      expect(result).toEqual(mockFoundToken);
      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledWith({
        where: { token: searchToken },
      });
      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledTimes(1);
    });

    it('should return null when token is not found', async () => {
      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(null);

      const result =
        await passwordResetTokenRepository.findByToken('non-existent-token');

      expect(result).toBeNull();
      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledWith({
        where: { token: 'non-existent-token' },
      });
    });

    it('should handle database errors during search', async () => {
      const dbError = new Error('Database query failed');
      mockPrismaClient.passwordResetToken.findFirst.mockRejectedValue(dbError);

      await expect(
        passwordResetTokenRepository.findByToken(searchToken)
      ).rejects.toThrow('Database query failed');
      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledWith({
        where: { token: searchToken },
      });
    });

    it('should find token with special characters', async () => {
      const specialToken = 'token-with-special-chars!@#$%^&*()';
      const expectedToken = {
        ...mockFoundToken,
        token: specialToken,
      };

      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(
        expectedToken
      );

      const result =
        await passwordResetTokenRepository.findByToken(specialToken);

      expect(result).toEqual(expectedToken);
      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledWith({
        where: { token: specialToken },
      });
    });

    it('should handle empty token string', async () => {
      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(null);

      const result = await passwordResetTokenRepository.findByToken('');

      expect(result).toBeNull();
      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledWith({
        where: { token: '' },
      });
    });
  });

  describe('deleteByTokenID', () => {
    const tokenId = 'token-id-123';

    const mockDeletedToken = {
      id: 'token-id-123',
      userId: 1,
      token: 'reset-token-123',
      expiresAt: new Date('2025-07-06T18:00:00.000Z'),
      used: false,
      createdAt: new Date('2025-07-05T18:00:00.000Z'),
    };

    it('should delete a password reset token by ID', async () => {
      mockPrismaClient.passwordResetToken.delete.mockResolvedValue(
        mockDeletedToken
      );

      const result =
        await passwordResetTokenRepository.deleteByTokenID(tokenId);

      expect(result).toEqual(mockDeletedToken);
      expect(mockPrismaClient.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: tokenId },
      });
      expect(mockPrismaClient.passwordResetToken.delete).toHaveBeenCalledTimes(
        1
      );
    });

    it('should handle deletion of non-existent token', async () => {
      const notFoundError = new Error('Record to delete does not exist');
      mockPrismaClient.passwordResetToken.delete.mockRejectedValue(
        notFoundError
      );

      await expect(
        passwordResetTokenRepository.deleteByTokenID('non-existent-id')
      ).rejects.toThrow('Record to delete does not exist');
      expect(mockPrismaClient.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should handle database errors during deletion', async () => {
      const dbError = new Error('Database delete operation failed');
      mockPrismaClient.passwordResetToken.delete.mockRejectedValue(dbError);

      await expect(
        passwordResetTokenRepository.deleteByTokenID(tokenId)
      ).rejects.toThrow('Database delete operation failed');
      expect(mockPrismaClient.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: tokenId },
      });
    });

    it('should delete token with UUID format ID', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      const expectedDeletedToken = {
        ...mockDeletedToken,
        id: uuidId,
      };

      mockPrismaClient.passwordResetToken.delete.mockResolvedValue(
        expectedDeletedToken
      );

      const result = await passwordResetTokenRepository.deleteByTokenID(uuidId);

      expect(result.id).toBe(uuidId);
      expect(mockPrismaClient.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: uuidId },
      });
    });

    it('should return complete token data after deletion', async () => {
      mockPrismaClient.passwordResetToken.delete.mockResolvedValue(
        mockDeletedToken
      );

      const result =
        await passwordResetTokenRepository.deleteByTokenID(tokenId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresAt');
      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('createdAt');
      expect(typeof result.id).toBe('string');
      expect(typeof result.userId).toBe('number');
      expect(typeof result.token).toBe('string');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(typeof result.used).toBe('boolean');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete token lifecycle', async () => {
      const createData = {
        userId: 1,
        token: 'lifecycle-token-123',
        expiresAt: new Date('2025-07-06T18:00:00.000Z'),
      };

      const createdToken = {
        id: 'lifecycle-id-123',
        userId: 1,
        token: 'lifecycle-token-123',
        expiresAt: new Date('2025-07-06T18:00:00.000Z'),
        used: false,
        createdAt: new Date('2025-07-05T18:00:00.000Z'),
      };

      const foundToken = {
        id: 'lifecycle-id-123',
        userId: 1,
        token: 'lifecycle-token-123',
        expiresAt: new Date('2025-07-06T18:00:00.000Z'),
      };

      // Mock create
      mockPrismaClient.passwordResetToken.create.mockResolvedValue(
        createdToken
      );

      // Mock find
      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(
        foundToken
      );

      // Mock delete
      mockPrismaClient.passwordResetToken.delete.mockResolvedValue(
        createdToken
      );

      // Test create
      const createResult =
        await passwordResetTokenRepository.create(createData);
      expect(createResult.token).toBe('lifecycle-token-123');

      // Test find
      const findResult = await passwordResetTokenRepository.findByToken(
        'lifecycle-token-123'
      );
      expect(findResult?.token).toBe('lifecycle-token-123');

      // Test delete
      const deleteResult =
        await passwordResetTokenRepository.deleteByTokenID('lifecycle-id-123');
      expect(deleteResult.id).toBe('lifecycle-id-123');

      // Verify all operations were called
      expect(mockPrismaClient.passwordResetToken.create).toHaveBeenCalledTimes(
        1
      );
      expect(
        mockPrismaClient.passwordResetToken.findFirst
      ).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.passwordResetToken.delete).toHaveBeenCalledTimes(
        1
      );
    });

    it('should handle expired token scenarios', async () => {
      const expiredDate = new Date('2025-07-04T18:00:00.000Z'); // Yesterday
      const expiredToken = {
        id: 'expired-id-123',
        userId: 1,
        token: 'expired-token-123',
        expiresAt: expiredDate,
      };

      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(
        expiredToken
      );

      const result =
        await passwordResetTokenRepository.findByToken('expired-token-123');

      expect(result?.expiresAt).toEqual(expiredDate);
      expect(result?.expiresAt.getTime()).toBeLessThan(new Date().getTime());
    });
  });
});
