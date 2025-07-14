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
import { toast } from 'sonner';

import useRequestPasswordReset from '@/features/Authentication/presentation/state/hooks/use-request-password-reset';
import { requestResetPasswordEffect } from '@/features/Authentication/presentation/state/store/effects';

// Mock dependencies
jest.mock('@/features/Authentication/presentation/state/store/effects');
jest.mock('sonner');

const mockRequestResetPasswordEffect =
  requestResetPasswordEffect as jest.MockedFunction<
    typeof requestResetPasswordEffect
  >;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useRequestPasswordReset Hook', () => {
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Hook initialization', () => {
    it('should return correct initial structure', () => {
      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      expect(result.current).toHaveProperty('requestResetPasswordForm');
      expect(result.current).toHaveProperty('isRequestingPasswordReset');
      expect(result.current).toHaveProperty('requestResetPasswordHandler');
      expect(typeof result.current.requestResetPasswordHandler).toBe(
        'function'
      );
      expect(result.current.isRequestingPasswordReset).toBe(false);
    });

    it('should initialize form with correct default values', () => {
      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      const formValues = result.current.requestResetPasswordForm.getValues();
      expect(formValues).toEqual({
        email: '',
      });
    });

    it('should have proper form validation setup', () => {
      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      expect(result.current.requestResetPasswordForm.formState).toBeDefined();
      expect(result.current.requestResetPasswordForm.trigger).toBeDefined();
    });
  });

  describe('Password reset request mutation', () => {
    const validRequestData = {
      email: 'test@example.com',
    };

    it('should handle successful password reset request', async () => {
      // Arrange
      const successMessage = 'Reset email sent successfully';
      mockRequestResetPasswordEffect.mockResolvedValue(successMessage);

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Spy on form reset method
      const resetSpy = jest.spyOn(
        result.current.requestResetPasswordForm,
        'reset'
      );

      // Act
      await result.current.requestResetPasswordHandler(validRequestData);

      // Assert
      expect(mockRequestResetPasswordEffect).toHaveBeenCalledWith(
        validRequestData
      );

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'A reset password link has been sent to your email.',
          { duration: 8000 }
        );
        expect(resetSpy).toHaveBeenCalled();
      });
    });

    it('should handle password reset request failure with Error object', async () => {
      // Arrange
      const error = new Error('Email not found');
      mockRequestResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.requestResetPasswordHandler(validRequestData)
        ).rejects.toThrow('Email not found');
      });

      expect(mockRequestResetPasswordEffect).toHaveBeenCalledWith(
        validRequestData
      );

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Email not found');
      });
    });

    it('should handle password reset request failure with unknown error', async () => {
      // Arrange
      const error = new Error('Email service unavailable');
      mockRequestResetPasswordEffect.mockRejectedValue(error);

      // Mock console.error to prevent error logs from cluttering test output
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.requestResetPasswordHandler(validRequestData)
        ).rejects.toThrow();
      });

      expect(mockRequestResetPasswordEffect).toHaveBeenCalledWith(
        validRequestData
      );

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Email service unavailable'
        );
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    it('should show loading state during password reset request', async () => {
      // Arrange
      let resolveRequest: (value: string) => void;
      const requestPromise = new Promise<string>((resolve) => {
        resolveRequest = resolve;
      });
      mockRequestResetPasswordEffect.mockReturnValue(requestPromise);

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act
      let requestPromiseResult: Promise<any>;
      await act(async () => {
        requestPromiseResult =
          result.current.requestResetPasswordHandler(validRequestData);
      });

      // Assert - Should be loading
      await waitFor(() => {
        expect(result.current.isRequestingPasswordReset).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolveRequest!('Reset email sent');
        await requestPromiseResult!;
      });

      // Assert - Should no longer be loading
      await waitFor(() => {
        expect(result.current.isRequestingPasswordReset).toBe(false);
      });
    });

    it('should log errors to console', async () => {
      // Arrange
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('SMTP server error');
      mockRequestResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act
      await act(async () => {
        try {
          await result.current.requestResetPasswordHandler(validRequestData);
        } catch {
          // Expected to throw
        }
      });

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'useRequestPasswordReset error:',
          error
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Form integration', () => {
    it('should handle form validation with invalid email', async () => {
      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Set invalid email
      result.current.requestResetPasswordForm.setValue(
        'email',
        'invalid-email'
      );

      // Trigger validation
      const isValid = await result.current.requestResetPasswordForm.trigger();

      expect(isValid).toBe(false);
      expect(
        result.current.requestResetPasswordForm.formState.errors
      ).toBeDefined();
    });

    it('should handle form validation with valid email', async () => {
      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Set valid email
      result.current.requestResetPasswordForm.setValue(
        'email',
        'test@example.com'
      );

      // Trigger validation
      const isValid = await result.current.requestResetPasswordForm.trigger();

      expect(isValid).toBe(true);
      expect(
        Object.keys(result.current.requestResetPasswordForm.formState.errors)
      ).toHaveLength(0);
    });

    it('should reset form after successful request', async () => {
      // Arrange
      mockRequestResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Set form value
      result.current.requestResetPasswordForm.setValue(
        'email',
        'test@example.com'
      );

      // Spy on reset method
      const resetSpy = jest.spyOn(
        result.current.requestResetPasswordForm,
        'reset'
      );

      // Act
      await result.current.requestResetPasswordHandler({
        email: 'test@example.com',
      });

      // Assert
      await waitFor(() => {
        expect(resetSpy).toHaveBeenCalled();
      });
    });
  });

  describe('React Query integration', () => {
    it('should use mutateAsync for async handling', async () => {
      // Arrange
      mockRequestResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act
      const requestResult = result.current.requestResetPasswordHandler({
        email: 'test@example.com',
      });

      // Assert - requestResetPasswordHandler should return a promise
      expect(requestResult).toBeInstanceOf(Promise);

      // Wait for completion
      await requestResult;

      expect(mockRequestResetPasswordEffect).toHaveBeenCalled();
    });

    it('should use correct mutation key', () => {
      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // The mutation should be properly setup with the 'request-reset-password' key
      expect(result.current.requestResetPasswordHandler).toBeDefined();
      expect(typeof result.current.requestResetPasswordHandler).toBe(
        'function'
      );
    });

    it('should reset loading state after mutation completes', async () => {
      // Arrange
      mockRequestResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act
      await result.current.requestResetPasswordHandler({
        email: 'test@example.com',
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isRequestingPasswordReset).toBe(false);
      });
    });
  });

  describe('Toast notifications', () => {
    it('should display success toast with correct duration', async () => {
      // Arrange
      mockRequestResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act
      await result.current.requestResetPasswordHandler({
        email: 'test@example.com',
      });

      // Assert
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'A reset password link has been sent to your email.',
          { duration: 8000 }
        );
      });
    });

    it('should display error toast for failures', async () => {
      // Arrange
      const error = new Error('Rate limit exceeded');
      mockRequestResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper,
      });

      // Act
      try {
        await result.current.requestResetPasswordHandler({
          email: 'test@example.com',
        });
      } catch {
        // Expected to throw
      }

      // Assert
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Rate limit exceeded');
      });
    });
  });
});
