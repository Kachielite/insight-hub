import { StateCreator } from 'zustand';

import { createUserActions } from '@/features/User/presentation/state/store/actions.ts';
import { initialUserState } from '@/features/User/presentation/state/store/state.ts';
import { UserSlice } from '@/features/User/presentation/state/store/types.ts';

export const createUserSlice: StateCreator<UserSlice> = (set, get, store) => ({
  ...initialUserState,
  ...(createUserActions(set, get, store) as UserSlice),
});
