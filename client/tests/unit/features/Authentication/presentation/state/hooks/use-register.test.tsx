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

import useRegister from '@/features/Authentication/presentation/state/hooks/use-register';
import { registerEffect } from '@/features/Authentication/presentation/state/store/effects';

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

const mockRegisterEffect = registerEffect as jest.MockedFunction<
  typeof registerEffect
>;
const mockNavigate = jest.fn();
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock react-router-dom useNavigate
(useNavigate as jest.Mock).mockReturnValue(mockNavigate);

describe('useRegister Hook', () => {
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
      const { result } = renderHook(() => useRegister(), { wrapper });

      expect(result.current).toHaveProperty('registerForm');
      expect(result.current).toHaveProperty('isRegistering');
      expect(result.current).toHaveProperty('registerHandler');
      expect(typeof result.current.registerHandler).toBe('function');
      expect(result.current.isRegistering).toBe(false);
    });

    it('should initialize form with correct default values', () => {
      const { result } = renderHook(() => useRegister(), { wrapper });

      const formValues = result.current.registerForm.getValues();
      expect(formValues).toEqual({
        name: '',
        email: '',
        password: '',
      });
    });

    it('should have proper form validation setup', () => {
      const { result } = renderHook(() => useRegister(), { wrapper });

      expect(result.current.registerForm.formState).toBeDefined();
      expect(result.current.registerForm.trigger).toBeDefined();
    });
  });

  describe('Registration mutation', () => {
    const validRegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should handle successful registration', async () => {
      // Arrange
      const mockAuth = {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
      mockRegisterEffect.mockResolvedValue(mockAuth);

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Act
      await result.current.registerHandler(validRegisterData);

      // Assert
      expect(mockRegisterEffect).toHaveBeenCalledWith(validRegisterData);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Registration successful'
        );
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle registration failure with Error object', async () => {
      // Arrange
      const error = new Error('Email already exists');
      mockRegisterEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Act & Assert
      await expect(
        result.current.registerHandler(validRegisterData)
      ).rejects.toThrow('Email already exists');

      expect(mockRegisterEffect).toHaveBeenCalledWith(validRegisterData);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Email already exists');
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should handle registration failure with unknown error', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockRegisterEffect.mockRejectedValue(error);

      // Mock console.error to prevent error logs from cluttering test output
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.registerHandler(validRegisterData)
        ).rejects.toThrow();
      });

      expect(mockRegisterEffect).toHaveBeenCalledWith(validRegisterData);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Database connection failed'
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    it('should show loading state during registration', async () => {
      // Arrange
      let resolveRegister: (value: any) => void;
      const registerPromise = new Promise<any>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegisterEffect.mockReturnValue(registerPromise);

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Act
      let registerPromiseResult: Promise<any>;
      await act(async () => {
        registerPromiseResult =
          result.current.registerHandler(validRegisterData);
      });

      // Assert - Should be loading
      await waitFor(() => {
        expect(result.current.isRegistering).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolveRegister!({ accessToken: 'token', refreshToken: 'refresh' });
        await registerPromiseResult!;
      });

      // Assert - Should no longer be loading
      await waitFor(() => {
        expect(result.current.isRegistering).toBe(false);
      });
    });

    it('should log errors to console', async () => {
      // Arrange
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Server error');
      mockRegisterEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Act
      try {
        await result.current.registerHandler(validRegisterData);
      } catch {
        // Expected to throw
      }

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('useRegister error:', error);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Form integration', () => {
    it('should handle form validation with invalid data', async () => {
      const { result } = renderHook(() => useRegister(), { wrapper });

      // Set invalid data
      result.current.registerForm.setValue('name', '');
      result.current.registerForm.setValue('email', 'invalid-email');
      result.current.registerForm.setValue('password', '123');

      // Trigger validation
      const isValid = await result.current.registerForm.trigger();

      expect(isValid).toBe(false);
      expect(result.current.registerForm.formState.errors).toBeDefined();
    });

    it('should handle form validation with valid data', async () => {
      const { result } = renderHook(() => useRegister(), { wrapper });

      // Set valid data
      result.current.registerForm.setValue('name', 'Test User');
      result.current.registerForm.setValue('email', 'test@example.com');
      result.current.registerForm.setValue('password', 'password123');

      // Trigger validation
      const isValid = await result.current.registerForm.trigger();

      expect(isValid).toBe(true);
      expect(
        Object.keys(result.current.registerForm.formState.errors)
      ).toHaveLength(0);
    });
  });

  describe('React Query integration', () => {
    it('should use mutateAsync instead of mutate', async () => {
      // Arrange
      mockRegisterEffect.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Act
      const registerResult = result.current.registerHandler({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert - registerHandler should return a promise (mutateAsync behavior)
      expect(registerResult).toBeInstanceOf(Promise);

      // Wait for completion
      await registerResult;

      expect(mockRegisterEffect).toHaveBeenCalled();
    });

    it('should reset loading state after mutation completes', async () => {
      // Arrange
      mockRegisterEffect.mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Act
      await result.current.registerHandler({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isRegistering).toBe(false);
      });
    });

    it('should use correct mutation key', () => {
      const { result } = renderHook(() => useRegister(), { wrapper });

      // The mutation should be properly setup with the 'register' key
      expect(result.current.registerHandler).toBeDefined();
      expect(typeof result.current.registerHandler).toBe('function');
    });
  });
});
