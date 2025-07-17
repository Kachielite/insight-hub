import { persist } from 'zustand/middleware';

import { createUserActions } from '@/features/User/presentation/state/store/actions.ts';
import { initialUserState } from '@/features/User/presentation/state/store/state.ts';
import { UserSlice } from '@/features/User/presentation/state/store/types.ts';

export const createUserSlice = persist(
  (set, get, store) => ({
    ...initialUserState,
    ...(createUserActions(set, get, store) as UserSlice),
  }),
  {
    name: 'user-storage', // unique name for localStorage
    partialize: (state: UserSlice) => ({ user: state.user }), // persist only user
  }
);
