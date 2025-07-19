import { describe, expect, it } from '@jest/globals';

import { initialUserState } from '@/features/User/presentation/state/store/state';
import type { UserSlice } from '@/features/User/presentation/state/store/types';

describe('User State', () => {
  describe('initialUserState', () => {
    it('should have user property set to null', () => {
      expect(initialUserState.user).toBe(null);
    });

    it('should only contain user property', () => {
      const keys = Object.keys(initialUserState);
      expect(keys).toEqual(['user']);
      expect(keys).toHaveLength(1);
    });

    it('should match Pick<UserSlice, "user"> type structure', () => {
      const expectedStructure: Pick<UserSlice, 'user'> = {
        user: null,
      };
      expect(initialUserState).toEqual(expectedStructure);
    });

    it('should be immutable reference', () => {
      expect(initialUserState).toBe(initialUserState);
    });

    it('should have correct property types', () => {
      expect(typeof initialUserState.user).toBe('object');
      expect(initialUserState.user).toBeNull();
    });
  });

  describe('state structure validation', () => {
    it('should be compatible with UserSlice state portion', () => {
      const mockUserSlice: UserSlice = {
        ...initialUserState,
        setUser: jest.fn(),
      };
      expect(mockUserSlice.user).toBe(null);
      expect(typeof mockUserSlice.setUser).toBe('function');
    });
  });
});
