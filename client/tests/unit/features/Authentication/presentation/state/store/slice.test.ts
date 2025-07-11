import { describe, expect, it, jest } from '@jest/globals';

import { createAuthActions } from '@/features/Authentication/presentation/state/store/actions';
import { createAuthSlice } from '@/features/Authentication/presentation/state/store/slice';
import { initialAuthState } from '@/features/Authentication/presentation/state/store/state';

// Mock the dependencies
jest.mock('@/features/Authentication/presentation/state/store/actions', () => ({
  createAuthActions: jest.fn(),
}));

jest.mock('@/features/Authentication/presentation/state/store/state', () => ({
  initialAuthState: { auth: null },
}));

const mockCreateAuthActions = createAuthActions as jest.MockedFunction<
  typeof createAuthActions
>;

describe('Authentication Slice', () => {
  let mockSet: jest.MockedFunction<any>;
  let mockGet: jest.MockedFunction<any>;
  let mockStore: any;

  const mockActions = {
    setAuth: jest.fn(),
  };

  beforeEach(() => {
    mockSet = jest.fn();
    mockGet = jest.fn();
    mockStore = {};

    mockCreateAuthActions.mockReturnValue(mockActions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuthSlice', () => {
    it('should create slice with initial state and actions', () => {
      // Act
      const slice = createAuthSlice(mockSet, mockGet, mockStore);

      // Assert
      expect(slice).toEqual({
        ...initialAuthState,
        ...mockActions,
      });
    });

    it('should call createAuthActions with correct parameters', () => {
      // Act
      createAuthSlice(mockSet, mockGet, mockStore);

      // Assert
      expect(mockCreateAuthActions).toHaveBeenCalledWith(
        mockSet,
        mockGet,
        mockStore
      );
      expect(mockCreateAuthActions).toHaveBeenCalledTimes(1);
    });

    it('should include initial auth state', () => {
      // Act
      const slice = createAuthSlice(mockSet, mockGet, mockStore);

      // Assert
      expect(slice).toHaveProperty('auth', null);
    });

    it('should include auth actions', () => {
      // Act
      const slice = createAuthSlice(mockSet, mockGet, mockStore);

      // Assert
      expect(slice).toHaveProperty('setAuth');
      expect(slice.setAuth).toBe(mockActions.setAuth);
    });

    it('should merge state and actions correctly', () => {
      // Arrange
      const customActions = {
        setAuth: jest.fn(),
        customAction: jest.fn(),
      };
      mockCreateAuthActions.mockReturnValue(customActions);

      // Act
      const slice = createAuthSlice(mockSet, mockGet, mockStore);

      // Assert
      expect(slice).toMatchObject({
        auth: null,
        setAuth: customActions.setAuth,
        customAction: customActions.customAction,
      });
    });
  });

  describe('StateCreator type compliance', () => {
    it('should be compatible with StateCreator<AuthSlice> type', () => {
      // This test ensures the function signature matches StateCreator expectations
      expect(typeof createAuthSlice).toBe('function');
    });

    it('should return proper AuthSlice structure', () => {
      // Act
      const slice = createAuthSlice(mockSet, mockGet, mockStore);

      // Assert - Check that the slice has the expected AuthSlice properties
      expect(slice).toHaveProperty('auth');
      expect(slice).toHaveProperty('setAuth');
      expect(typeof slice.setAuth).toBe('function');
    });
  });

  describe('integration behavior', () => {
    it('should properly integrate with Zustand store creation', () => {
      // This simulates how Zustand would call the slice creator
      const slice = createAuthSlice(mockSet, mockGet, mockStore);

      // Verify the slice can be used as expected
      expect(slice.auth).toBe(null);
      expect(typeof slice.setAuth).toBe('function');

      // Verify actions are created with proper store methods
      expect(mockCreateAuthActions).toHaveBeenCalledWith(
        mockSet,
        mockGet,
        mockStore
      );
    });
  });
});
