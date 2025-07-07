import type Auth from '@/features/Authentication/domain/entity/auth.ts';

export type AuthSlice = {
  // state
  auth: Auth | null;

  // actions
  setAuth: (auth: Auth | null) => void;
};
