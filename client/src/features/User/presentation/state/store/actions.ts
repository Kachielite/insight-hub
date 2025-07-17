import { StateCreator } from 'zustand';

import { UserSlice } from '@/features/User/presentation/state/store/types.ts';

export const createUserActions: StateCreator<
  UserSlice,
  [],
  [],
  Pick<UserSlice, 'setUser'>
> = () => ({
  user: null,
  setUser: (user) => ({ user }),
});
