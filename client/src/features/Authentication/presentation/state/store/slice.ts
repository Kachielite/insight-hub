import { createAuthActions } from '@/features/Authentication/presentation/state/store/actions.ts';
import { initialAuthState } from '@/features/Authentication/presentation/state/store/state.ts';
import type { AuthSlice } from '@/features/Authentication/presentation/state/store/types.ts';

import type { StateCreator } from 'zustand';

export const createAuthSlice: StateCreator<AuthSlice> = (set, get, store) => ({
  ...initialAuthState,
  ...createAuthActions(set, get, store),
});
