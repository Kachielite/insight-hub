import { describe, expect, it, jest } from '@jest/globals';

import { createUserActions } from '@/features/User/presentation/state/store/actions';
import { createUserSlice } from '@/features/User/presentation/state/store/slice';

jest.mock('@/features/User/presentation/state/store/actions', () => ({
  createUserActions: jest.fn(),
}));

jest.mock('@/features/User/presentation/state/store/state', () => ({
  initialUserState: { user: null },
}));

const mockCreateUserActions = createUserActions as jest.MockedFunction<
  typeof createUserActions
>;

describe('User Slice', () => {
  let mockSet: jest.MockedFunction<any>;
  let mockGet: jest.MockedFunction<any>;
  let mockStore: any;

  const mockActions = {
    setUser: jest.fn(),
  };

  beforeEach(() => {
    mockSet = jest.fn();
    mockGet = jest.fn();
    mockStore = {};
    mockCreateUserActions.mockReturnValue(mockActions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserSlice', () => {
    it('should initialize with user state and actions', () => {
      const slice = createUserSlice(mockSet, mockGet, mockStore);
      expect(slice).toHaveProperty('user', null);
      expect(slice).toHaveProperty('setUser');
      expect(typeof slice.setUser).toBe('function');
    });
  });
});
