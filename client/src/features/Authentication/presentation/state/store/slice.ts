import type { StateCreator } from 'zustand';
import type { AuthSlice } from '@/features/Authentication/presentation/state/store/types.ts';
import { initialAuthState } from '@/features/Authentication/presentation/state/store/state.ts';
import { createAuthActions } from '@/features/Authentication/presentation/state/store/actions.ts';

export const createAuthSlice: StateCreator<AuthSlice> = (set, get, store) => ({
  ...initialAuthState,
  ...createAuthActions(set, get, store),
});
