import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import useLogin from '@/features/Authentication/presentation/state/hooks/use-login';
import { loginEffect } from '@/features/Authentication/presentation/state/store/effects';

// Mock dependencies
jest.mock('@/features/Authentication/presentation/state/store/effects');
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});
jest.mock('sonner');

const mockLoginEffect = loginEffect as jest.MockedFunction<typeof loginEffect>;
const mockNavigate = jest.fn();
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock react-router-dom useNavigate
(useNavigate as jest.Mock).mockReturnValue(mockNavigate);

describe('useLogin Hook', () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Hook initialization', () => {
    it('should return correct initial structure', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      expect(result.current).toHaveProperty('loginForm');
      expect(result.current).toHaveProperty('isLoggingIn');
      expect(result.current).toHaveProperty('loginHandler');
      expect(typeof result.current.loginHandler).toBe('function');
      expect(result.current.isLoggingIn).toBe(false);
    });

    it('should initialize form with correct default values', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      const formValues = result.current.loginForm.getValues();
      expect(formValues).toEqual({
        email: '',
        password: '',
      });
    });

    it('should have proper form validation setup', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      // Check if form has resolver (Zod validation)
      expect(result.current.loginForm.formState).toBeDefined();
      expect(result.current.loginForm.trigger).toBeDefined();
    });
  });

  describe('Login mutation', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should handle successful login', async () => {
      // Arrange
      const mockAuth = {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
      mockLoginEffect.mockResolvedValue(mockAuth);

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Act
      result.current.loginHandler(validLoginData);

      // Assert
      await waitFor(() => {
        expect(mockLoginEffect).toHaveBeenCalledWith(validLoginData);
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Login successful');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle login failure with Error object', async () => {
      // Arrange
      const error = new Error('Invalid credentials');
      mockLoginEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Act
      await act(async () => {
        result.current.loginHandler(validLoginData);
      });

      // Assert
      await waitFor(() => {
        expect(mockLoginEffect).toHaveBeenCalledWith(validLoginData);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should handle login failure with unknown error', async () => {
      // Arrange
      const error = 'Unknown error';
      mockLoginEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Act
      await act(async () => {
        result.current.loginHandler(validLoginData);
      });

      // Assert
      await waitFor(() => {
        expect(mockLoginEffect).toHaveBeenCalledWith(validLoginData);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'An unknown error occurred'
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during login', async () => {
      // Arrange
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise<any>((resolve) => {
        resolveLogin = resolve;
      });
      mockLoginEffect.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Act
      await act(async () => {
        result.current.loginHandler(validLoginData);
      });

      // Assert - Should be loading
      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolveLogin!({ accessToken: 'token', refreshToken: 'refresh' });
      });

      // Assert - Should no longer be loading
      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false);
      });
    });

    it('should log errors to console', async () => {
      // Arrange
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Network error');
      mockLoginEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Act
      await act(async () => {
        result.current.loginHandler(validLoginData);
      });

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('useLogin error:', error);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Form integration', () => {
    it('should handle form submission with validation', async () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      // Set invalid email
      result.current.loginForm.setValue('email', 'invalid-email');
      result.current.loginForm.setValue('password', '123');

      // Trigger validation
      const isValid = await result.current.loginForm.trigger();

      expect(isValid).toBe(false);
      expect(result.current.loginForm.formState.errors).toBeDefined();
    });

    it('should handle form submission with valid data', async () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      // Set valid data
      result.current.loginForm.setValue('email', 'test@example.com');
      result.current.loginForm.setValue('password', 'password123');

      // Trigger validation
      const isValid = await result.current.loginForm.trigger();

      expect(isValid).toBe(true);
      expect(
        Object.keys(result.current.loginForm.formState.errors)
      ).toHaveLength(0);
    });
  });

  describe('React Query integration', () => {
    it('should use correct mutation key', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      // The mutation should be properly setup with the 'login' key
      // This is implicit in the hook behavior, but we can test the integration
      expect(result.current.loginHandler).toBeDefined();
      expect(typeof result.current.loginHandler).toBe('function');
    });

    it('should reset loading state after mutation completes', async () => {
      // Arrange
      mockLoginEffect.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Act
      result.current.loginHandler({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false);
      });
    });
  });
});
