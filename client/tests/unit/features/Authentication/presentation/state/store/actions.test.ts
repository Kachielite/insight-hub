import { describe, expect, it, jest } from '@jest/globals';

import type Auth from '@/features/Authentication/domain/entity/auth';
import { createAuthActions } from '@/features/Authentication/presentation/state/store/actions';
import type { AuthSlice } from '@/features/Authentication/presentation/state/store/types';

import type { StateCreator } from 'zustand';

describe('Authentication Actions', () => {
  let mockSet: jest.MockedFunction<any>;
  let mockGet: jest.MockedFunction<any>;
  let mockStore: any;
  let actions: Pick<AuthSlice, 'setAuth'>;

  const mockAuth: Auth = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(() => {
    mockSet = jest.fn();
    mockGet = jest.fn();
    mockStore = {};

    // Create the actions using the action creator
    actions = createAuthActions(mockSet, mockGet, mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuthActions', () => {
    it('should create actions with initial auth state as null', () => {
      expect(actions).toHaveProperty('auth', null);
      expect(actions).toHaveProperty('setAuth');
      expect(typeof actions.setAuth).toBe('function');
    });

    it('should return correct action structure', () => {
      expect(actions).toMatchObject({
        auth: null,
        setAuth: expect.any(Function),
      });
    });
  });

  describe('setAuth action', () => {
    it('should call set with auth object when setting auth', () => {
      // Act
      actions.setAuth(mockAuth);

      // Assert
      expect(mockSet).toHaveBeenCalledWith({ auth: mockAuth });
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it('should call set with null when clearing auth', () => {
      // Act
      actions.setAuth(null);

      // Assert
      expect(mockSet).toHaveBeenCalledWith({ auth: null });
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple auth updates', () => {
      // Act
      actions.setAuth(mockAuth);
      actions.setAuth(null);
      actions.setAuth(mockAuth);

      // Assert
      expect(mockSet).toHaveBeenCalledTimes(3);
      expect(mockSet).toHaveBeenNthCalledWith(1, { auth: mockAuth });
      expect(mockSet).toHaveBeenNthCalledWith(2, { auth: null });
      expect(mockSet).toHaveBeenNthCalledWith(3, { auth: mockAuth });
    });

    it('should accept different auth objects', () => {
      // Arrange
      const differentAuth: Auth = {
        accessToken: 'different-token',
        refreshToken: 'different-refresh',
      };

      // Act
      actions.setAuth(differentAuth);

      // Assert
      expect(mockSet).toHaveBeenCalledWith({ auth: differentAuth });
    });
  });

  describe('StateCreator type compliance', () => {
    it('should be compatible with StateCreator type', () => {
      // This test ensures the function signature matches StateCreator expectations
      const creator: StateCreator<
        AuthSlice,
        [],
        [],
        Pick<AuthSlice, 'setAuth'>
      > = createAuthActions;

      expect(typeof creator).toBe('function');
    });
  });
});
