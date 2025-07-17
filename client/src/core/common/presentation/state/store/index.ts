import { create } from 'zustand/react';

import { createAuthSlice } from '@/features/Authentication/presentation/state/store/slice.ts';
import type { AuthSlice } from '@/features/Authentication/presentation/state/store/types.ts';
import { createUserSlice } from '@/features/User/presentation/state/store/slice.ts';
import type { UserSlice } from '@/features/User/presentation/state/store/types.ts';

type AppState = AuthSlice & UserSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createUserSlice(...a),
}));
