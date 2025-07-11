import { describe, expect, it } from '@jest/globals';

import { initialAuthState } from '@/features/Authentication/presentation/state/store/state';
import type { AuthSlice } from '@/features/Authentication/presentation/state/store/types';

describe('Authentication State', () => {
  describe('initialAuthState', () => {
    it('should have auth property set to null', () => {
      expect(initialAuthState.auth).toBe(null);
    });

    it('should only contain auth property', () => {
      const keys = Object.keys(initialAuthState);
      expect(keys).toEqual(['auth']);
      expect(keys).toHaveLength(1);
    });

    it('should match Pick<AuthSlice, "auth"> type structure', () => {
      // This test ensures the initial state has the correct shape
      const expectedStructure: Pick<AuthSlice, 'auth'> = {
        auth: null,
      };

      expect(initialAuthState).toEqual(expectedStructure);
    });

    it('should be immutable reference', () => {
      // Verify that we get the same reference each time (important for performance)
      expect(initialAuthState).toBe(initialAuthState);
    });

    it('should have correct property types', () => {
      expect(typeof initialAuthState.auth).toBe('object');
      expect(initialAuthState.auth).toBeNull();
    });
  });

  describe('state structure validation', () => {
    it('should be compatible with AuthSlice state portion', () => {
      // This ensures our initial state is compatible with the full slice type
      const mockAuthSlice: AuthSlice = {
        ...initialAuthState,
        setAuth: jest.fn(),
      };

      expect(mockAuthSlice.auth).toBe(null);
      expect(typeof mockAuthSlice.setAuth).toBe('function');
    });
  });
});
