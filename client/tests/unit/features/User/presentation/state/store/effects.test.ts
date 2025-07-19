import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import * as E from 'fp-ts/Either';

import Role from '@/core/common/domain/entity/enum/role';
import type { Failure } from '@/core/error/failure';
import User from '@/features/User/domain/entity/user';
import { fetchUserEffect } from '@/features/User/presentation/state/store/effects';
import { getUserUseCases } from '@/init-dependencies/user-di';

// Mock dependencies
jest.mock('@/init-dependencies/user-di');

const mockGetUserUseCases = getUserUseCases as jest.MockedFunction<
  typeof getUserUseCases
>;

describe('User Effects', () => {
  const mockUser = new User(
    1,
    'Mock User',
    'mock@example.com',
    Role.MEMBER,
    new Date().toISOString(),
    []
  );

  const mockFailure: Failure = {
    message: 'User fetch failed',
  };

  let executeMock: jest.MockedFunction<any>;
  let mockGetUserUseCase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    executeMock = jest.fn();
    mockGetUserUseCase = {
      execute: executeMock,
      userRepository: { getUser: jest.fn() },
    };
    mockGetUserUseCases.mockReturnValue({
      getUserUseCase: mockGetUserUseCase,
    } as any);

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserEffect', () => {
    it('should return user on success', async () => {
      executeMock.mockResolvedValue(E.right(mockUser));
      const result = await fetchUserEffect();
      expect(result).toEqual(mockUser);
    });

    it('should throw error on failure', async () => {
      executeMock.mockResolvedValue(E.left(mockFailure));
      await expect(fetchUserEffect()).rejects.toThrow('User fetch failed');
    });
  });
});
