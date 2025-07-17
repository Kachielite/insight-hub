import { UserSlice } from '@/features/User/presentation/state/store/types.ts';

export const initialUserState: Pick<UserSlice, 'user'> = {
  user: null,
};
