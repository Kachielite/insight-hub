import type Auth from '@/features/Authentication/domain/entity/auth.ts';

import type { AuthSlice } from './types.ts';
import type { StateCreator } from 'zustand';

export const createAuthActions: StateCreator<
  AuthSlice,
  [],
  [],
  Pick<AuthSlice, 'setAuth'>
> = (set) => ({
  auth: null,
  setAuth: (auth: Auth | null) => set({ auth }),
});
