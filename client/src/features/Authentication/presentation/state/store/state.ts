import type { AuthSlice } from './types';

export const initialAuthState: Pick<AuthSlice, 'auth'> = {
  auth: null,
};
