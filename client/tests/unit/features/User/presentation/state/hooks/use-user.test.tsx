import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import React, { JSX } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

import Role from '@/core/common/domain/entity/enum/role';
import { useAppStore } from '@/core/common/presentation/state/store';
import User from '@/features/User/domain/entity/user';
import useUser from '@/features/User/presentation/state/hooks/use-user';
import { fetchUserEffect } from '@/features/User/presentation/state/store/effects';

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

const mockFetchUserEffect = fetchUserEffect as jest.MockedFunction<
  typeof fetchUserEffect
>;
const mockToast = toast as jest.Mocked<typeof toast>;

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
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('fetchCurrentUser');
    expect(typeof result.current.fetchCurrentUser).toBe('function');
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch user successfully and call setUser', async () => {
    const mockUser = new User(
      1,
      'Mock User',
      'mock@example.com',
      Role.MEMBER,
      new Date().toISOString(),
      []
    );
    mockFetchUserEffect.mockResolvedValue(mockUser);
    const { result } = renderHook(() => useUser(), { wrapper });
    await result.current.fetchCurrentUser();
    await waitFor(() => {
      expect(mockFetchUserEffect).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    });
  });
  it('should handle fetch user error with Error object', async () => {
    const error = new Error('User fetch failed');
    mockFetchUserEffect.mockRejectedValue(error);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useUser(), { wrapper });
    await expect(result.current.fetchCurrentUser()).rejects.toThrow(
      'User fetch failed'
    );
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'useUser: Error fetching user data:',
        error
      );
      expect(mockToast.error).toHaveBeenCalledWith('User fetch failed');
    });
    consoleSpy.mockRestore();
  });

  it('should handle fetch user error with unknown error', async () => {
    mockFetchUserEffect.mockRejectedValue('Unknown error');
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useUser(), { wrapper });
    try {
      await result.current.fetchCurrentUser();
    } catch {
      // Swallow error to prevent test failure due to thrown string
    }
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'useUser: Error fetching user data:',
        'Unknown error'
      );
      expect(mockToast.error).toHaveBeenCalledWith('An unknown error occurred');
    });
    consoleSpy.mockRestore();
  });

  it('should show loading state during fetch', async () => {
    let resolveUser: (value: any) => void;
    const userPromise = new Promise<any>((resolve) => {
      resolveUser = resolve;
    });
    mockFetchUserEffect.mockReturnValue(userPromise);
    const { result } = renderHook(() => useUser(), { wrapper });
    const fetchPromise = result.current.fetchCurrentUser();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
    resolveUser!(
      new User(
        2,
        'Loading User',
        'loading@example.com',
        Role.MEMBER,
        new Date().toISOString(),
        []
      )
    );
    await fetchPromise;
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
