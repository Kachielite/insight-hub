import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { renderHook } from '@testing-library/react';
import React, { JSX } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import { useAppStore } from '@/core/common/presentation/state/store';
import useUser from '@/features/User/presentation/state/hooks/use-user';

// Mock dependencies
jest.mock('@/features/User/presentation/state/store/effects');
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});
jest.mock('sonner');
jest.mock('@/core/common/presentation/state/store', () => ({
  useAppStore: jest.fn(),
}));
const mockSetUser = jest.fn();

describe('useUser Hook', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;

  beforeEach(() => {
    (useAppStore as unknown as jest.Mock).mockImplementation(() => ({
      setUser: mockSetUser,
    }));
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct initial structure', () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    expect(result.current).toHaveProperty('isLoadingUserData');
    expect(typeof result.current.isLoadingUserData).toBe('boolean');
  });
});
