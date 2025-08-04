import { describe, expect, it, jest } from '@jest/globals';

import Role from '@/core/common/domain/entity/enum/role';
import User from '@/features/User/domain/entity/user';
import { createUserActions } from '@/features/User/presentation/state/store/actions';
import type { UserSlice } from '@/features/User/presentation/state/store/types';

describe('User Actions', () => {
  let mockSet: jest.MockedFunction<any>;
  let mockGet: jest.MockedFunction<any>;
  let mockStore: any;
  let actions: Pick<UserSlice, 'setUser'>;

  const mockUser = new User(
    1,
    'Mock User',
    'mock@example.com',
    Role.MEMBER,
    new Date().toISOString(),
    []
  );

  beforeEach(() => {
    mockSet = jest.fn();
    mockGet = jest.fn();
    mockStore = {};
    actions = createUserActions(mockSet, mockGet, mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserActions', () => {
    it('should create actions with setUser function', () => {
      expect(actions).toHaveProperty('setUser');
      expect(typeof actions.setUser).toBe('function');
    });

    it('should return correct action structure', () => {
      expect(actions).toMatchObject({
        setUser: expect.any(Function),
      });
    });

    it('setUser should call set with user', () => {
      actions.setUser(mockUser);
      expect(mockSet).toHaveBeenCalledWith({ user: mockUser });
    });

    it('setUser should call set with null', () => {
      actions.setUser(null);
      expect(mockSet).toHaveBeenCalledWith({ user: null });
    });
  });
});
