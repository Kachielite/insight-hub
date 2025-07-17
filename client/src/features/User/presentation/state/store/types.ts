import User from '@/features/User/domain/entity/user.ts';

export type UserSlice = {
  // state
  user: User | null;

  // actions
  setUser: (user: User | null) => void;
};
