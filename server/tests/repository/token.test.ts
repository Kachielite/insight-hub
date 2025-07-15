import { container } from 'tsyringe';

import mockPrisma from '@config/db';
import { TokenType } from '@prisma';
import TokenRepository from '@repository/implementation/TokenRepository';
import { ITokenRepository } from '@repository/ITokenRepository';

// Mock the Prisma client with properly typed Jest mocks
jest.mock('@config/db', () => ({
  token: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

// Create a properly typed mock object
const mockPrismaClient = mockPrisma as {
  token: {
    create: jest.MockedFunction<any>;
    findFirst: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  };
};

describe('TokenRepository', () => {
  let tokenRepository: ITokenRepository;

  beforeAll(() => {
    const testContainer = container.createChildContainer();
    tokenRepository = testContainer.resolve(TokenRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createToken', () => {
    const mockCreatedToken = {
      id: 1,
      value: 'test-token-123',
      type: TokenType.INVITE,
      projectId: 1,
      userId: 2,
      email: 'test@example.com',
      expiresAt: new Date('2025-07-16T18:00:00.000Z'),
      createdAt: new Date('2025-07-15T18:00:00.000Z'),
      updatedAt: new Date('2025-07-15T18:00:00.000Z'),
    };

    it('should create a token with all optional parameters', async () => {
      mockPrismaClient.token.create.mockResolvedValue(mockCreatedToken);

      const result = await tokenRepository.createToken(
        'test-token-123',
        TokenType.INVITE,
        new Date('2025-07-16T18:00:00.000Z'),
        1,
        2,
        'test@example.com'
      );

      expect(result).toEqual(mockCreatedToken);
      expect(mockPrismaClient.token.create).toHaveBeenCalledWith({
        data: {
          value: 'test-token-123',
          type: TokenType.INVITE,
          projectId: 1,
          userId: 2,
          email: 'test@example.com',
          expiresAt: new Date('2025-07-16T18:00:00.000Z'),
        },
      });
      expect(mockPrismaClient.token.create).toHaveBeenCalledTimes(1);
    });

    it('should create a token with only required parameters', async () => {
      const tokenWithoutOptionals = {
        ...mockCreatedToken,
        projectId: null,
        userId: null,
        email: null,
      };

      mockPrismaClient.token.create.mockResolvedValue(tokenWithoutOptionals);

      const result = await tokenRepository.createToken(
        'test-token-123',
        TokenType.PASSWORD_RESET,
        new Date('2025-07-16T18:00:00.000Z')
      );

      expect(result).toEqual(tokenWithoutOptionals);
      expect(mockPrismaClient.token.create).toHaveBeenCalledWith({
        data: {
          value: 'test-token-123',
          type: TokenType.PASSWORD_RESET,
          projectId: undefined,
          userId: undefined,
          email: undefined,
          expiresAt: new Date('2025-07-16T18:00:00.000Z'),
        },
      });
    });

    it('should create a token with projectId only', async () => {
      const tokenWithProjectId = {
        ...mockCreatedToken,
        userId: null,
        email: null,
      };

      mockPrismaClient.token.create.mockResolvedValue(tokenWithProjectId);

      const result = await tokenRepository.createToken(
        'project-token-456',
        TokenType.INVITE,
        new Date('2025-07-16T18:00:00.000Z'),
        1
      );

      expect(result).toEqual(tokenWithProjectId);
      expect(mockPrismaClient.token.create).toHaveBeenCalledWith({
        data: {
          value: 'project-token-456',
          type: TokenType.INVITE,
          projectId: 1,
          userId: undefined,
          email: undefined,
          expiresAt: new Date('2025-07-16T18:00:00.000Z'),
        },
      });
    });

    it('should create a token with userId only', async () => {
      const tokenWithUserId = {
        ...mockCreatedToken,
        projectId: null,
        email: null,
      };

      mockPrismaClient.token.create.mockResolvedValue(tokenWithUserId);

      const result = await tokenRepository.createToken(
        'user-token-789',
        TokenType.PASSWORD_RESET,
        new Date('2025-07-16T18:00:00.000Z'),
        undefined,
        2
      );

      expect(result).toEqual(tokenWithUserId);
      expect(mockPrismaClient.token.create).toHaveBeenCalledWith({
        data: {
          value: 'user-token-789',
          type: TokenType.PASSWORD_RESET,
          projectId: undefined,
          userId: 2,
          email: undefined,
          expiresAt: new Date('2025-07-16T18:00:00.000Z'),
        },
      });
    });

    it('should handle database errors during token creation', async () => {
      const dbError = new Error('Token value must be unique');
      mockPrismaClient.token.create.mockRejectedValue(dbError);

      await expect(
        tokenRepository.createToken(
          'duplicate-token',
          TokenType.INVITE,
          new Date('2025-07-16T18:00:00.000Z')
        )
      ).rejects.toThrow('Token value must be unique');

      expect(mockPrismaClient.token.create).toHaveBeenCalledWith({
        data: {
          value: 'duplicate-token',
          type: TokenType.INVITE,
          projectId: undefined,
          userId: undefined,
          email: undefined,
          expiresAt: new Date('2025-07-16T18:00:00.000Z'),
        },
      });
    });

    it('should create tokens with different token types', async () => {
      const tokenTypes = [
        TokenType.INVITE,
        TokenType.PASSWORD_RESET,
        TokenType.OTHER,
      ];

      for (const tokenType of tokenTypes) {
        const mockToken = {
          ...mockCreatedToken,
          type: tokenType,
          value: `test-token-${tokenType}`,
        };

        mockPrismaClient.token.create.mockResolvedValue(mockToken);

        const result = await tokenRepository.createToken(
          `test-token-${tokenType}`,
          tokenType,
          new Date('2025-07-16T18:00:00.000Z')
        );

        expect(result.type).toBe(tokenType);
        expect(result.value).toBe(`test-token-${tokenType}`);
      }
    });
  });

  describe('findTokenByToken', () => {
    const mockToken = {
      id: 1,
      value: 'existing-token-123',
      type: TokenType.INVITE,
      projectId: 1,
      userId: 2,
      email: 'test@example.com',
      expiresAt: new Date('2025-07-16T18:00:00.000Z'),
      createdAt: new Date('2025-07-15T18:00:00.000Z'),
      updatedAt: new Date('2025-07-15T18:00:00.000Z'),
    };

    it('should find token by token value successfully', async () => {
      mockPrismaClient.token.findFirst.mockResolvedValue(mockToken);

      const result =
        await tokenRepository.findTokenByToken('existing-token-123');

      expect(result).toEqual(mockToken);
      expect(mockPrismaClient.token.findFirst).toHaveBeenCalledWith({
        where: {
          value: 'existing-token-123',
        },
      });
      expect(mockPrismaClient.token.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should return null when token is not found', async () => {
      mockPrismaClient.token.findFirst.mockResolvedValue(null);

      const result =
        await tokenRepository.findTokenByToken('non-existing-token');

      expect(result).toBeNull();
      expect(mockPrismaClient.token.findFirst).toHaveBeenCalledWith({
        where: {
          value: 'non-existing-token',
        },
      });
    });

    it('should handle database errors during token search', async () => {
      const dbError = new Error('Database connection error');
      mockPrismaClient.token.findFirst.mockRejectedValue(dbError);

      await expect(
        tokenRepository.findTokenByToken('error-token')
      ).rejects.toThrow('Database connection error');

      expect(mockPrismaClient.token.findFirst).toHaveBeenCalledWith({
        where: {
          value: 'error-token',
        },
      });
    });

    it('should handle empty string token value', async () => {
      mockPrismaClient.token.findFirst.mockResolvedValue(null);

      const result = await tokenRepository.findTokenByToken('');

      expect(result).toBeNull();
      expect(mockPrismaClient.token.findFirst).toHaveBeenCalledWith({
        where: {
          value: '',
        },
      });
    });
  });

  describe('deleteToken', () => {
    it('should delete token successfully', async () => {
      mockPrismaClient.token.delete.mockResolvedValue({
        id: 1,
        value: 'deleted-token',
        type: TokenType.INVITE,
        projectId: 1,
        userId: 2,
        email: 'test@example.com',
        expiresAt: new Date('2025-07-16T18:00:00.000Z'),
        createdAt: new Date('2025-07-15T18:00:00.000Z'),
        updatedAt: new Date('2025-07-15T18:00:00.000Z'),
      });

      await tokenRepository.deleteToken(1);

      expect(mockPrismaClient.token.delete).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
      expect(mockPrismaClient.token.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors during token deletion', async () => {
      const dbError = new Error('Token not found');
      mockPrismaClient.token.delete.mockRejectedValue(dbError);

      await expect(tokenRepository.deleteToken(999)).rejects.toThrow(
        'Token not found'
      );

      expect(mockPrismaClient.token.delete).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
    });

    it('should handle deletion of non-existent token ID', async () => {
      const notFoundError = new Error('Record to delete does not exist.');
      mockPrismaClient.token.delete.mockRejectedValue(notFoundError);

      await expect(tokenRepository.deleteToken(0)).rejects.toThrow(
        'Record to delete does not exist.'
      );

      expect(mockPrismaClient.token.delete).toHaveBeenCalledWith({
        where: {
          id: 0,
        },
      });
    });

    it('should handle negative token ID', async () => {
      const invalidIdError = new Error('Invalid token ID');
      mockPrismaClient.token.delete.mockRejectedValue(invalidIdError);

      await expect(tokenRepository.deleteToken(-1)).rejects.toThrow(
        'Invalid token ID'
      );

      expect(mockPrismaClient.token.delete).toHaveBeenCalledWith({
        where: {
          id: -1,
        },
      });
    });
  });
});
