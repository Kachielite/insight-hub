import type { AuthSlice } from '@/features/Authentication/presentation/state/store/types.ts';
import { create } from 'zustand/react';
import { createAuthSlice } from '@/features/Authentication/presentation/state/store/slice.ts';

type AppState = AuthSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
}));
