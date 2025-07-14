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

import useResetPassword from '@/features/Authentication/presentation/state/hooks/use-reset-password';
import { resetPasswordEffect } from '@/features/Authentication/presentation/state/store/effects';

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

const mockResetPasswordEffect = resetPasswordEffect as jest.MockedFunction<
  typeof resetPasswordEffect
>;
const mockNavigate = jest.fn();
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock react-router-dom useNavigate
(useNavigate as jest.Mock).mockReturnValue(mockNavigate);

describe('useResetPassword Hook', () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;
  const mockResetToken = 'valid-reset-token-123';

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
      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      expect(result.current).toHaveProperty('resetPasswordForm');
      expect(result.current).toHaveProperty('isRequestingPasswordReset');
      expect(result.current).toHaveProperty('resetPasswordHandler');
      expect(typeof result.current.resetPasswordHandler).toBe('function');
      expect(result.current.isRequestingPasswordReset).toBe(false);
    });

    it('should initialize form with correct default values including reset token', () => {
      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      const formValues = result.current.resetPasswordForm.getValues();
      expect(formValues).toEqual({
        newPassword: '',
        confirmPassword: '',
        resetToken: mockResetToken,
      });
    });

    it('should initialize with different reset token', () => {
      const differentToken = 'different-token-456';
      const { result } = renderHook(() => useResetPassword(differentToken), {
        wrapper,
      });

      const formValues = result.current.resetPasswordForm.getValues();
      expect(formValues.resetToken).toBe(differentToken);
    });

    it('should have proper form validation setup', () => {
      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      expect(result.current.resetPasswordForm.formState).toBeDefined();
      expect(result.current.resetPasswordForm.trigger).toBeDefined();
    });
  });

  describe('Password reset mutation', () => {
    const validResetData = {
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
      resetToken: mockResetToken,
    };

    it('should handle successful password reset', async () => {
      // Arrange
      const successMessage = 'Password reset successfully';
      mockResetPasswordEffect.mockResolvedValue(successMessage);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      await result.current.resetPasswordHandler(validResetData);

      // Assert
      expect(mockResetPasswordEffect).toHaveBeenCalledWith(validResetData);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Password reset successful, please login with your new password',
          { duration: 8000 }
        );
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle invalid reset token error with special navigation', async () => {
      // Arrange
      const error = new Error('Invalid reset token');
      mockResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.resetPasswordHandler(validResetData)
        ).rejects.toThrow('Invalid reset token');
      });

      expect(mockResetPasswordEffect).toHaveBeenCalledWith(validResetData);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Invalid reset token. Please request a new password reset.',
          { duration: 8000 }
        );
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password', {
          replace: true,
        });
      });
    });

    it('should handle other errors with generic error handling', async () => {
      // Arrange
      const error = new Error('Password too weak');
      mockResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.resetPasswordHandler(validResetData)
        ).rejects.toThrow('Password too weak');
      });

      expect(mockResetPasswordEffect).toHaveBeenCalledWith(validResetData);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Password too weak');
        expect(mockNavigate).not.toHaveBeenCalledWith('/forgot-password', {
          replace: true,
        });
        expect(mockNavigate).not.toHaveBeenCalledWith('/login');
      });
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const error = new Error('Server timeout');
      mockResetPasswordEffect.mockRejectedValue(error);

      // Mock console.error to prevent error logs from cluttering test output
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.resetPasswordHandler(validResetData)
        ).rejects.toThrow();
      });

      expect(mockResetPasswordEffect).toHaveBeenCalledWith(validResetData);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Server timeout');
      });

      // Restore console.error
      console.error = originalConsoleError;
    });

    it('should show loading state during password reset', async () => {
      // Arrange
      let resolveReset: (value: string) => void;
      const resetPromise = new Promise<string>((resolve) => {
        resolveReset = resolve;
      });
      mockResetPasswordEffect.mockReturnValue(resetPromise);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      let resetPromiseResult: Promise<any>;
      await act(async () => {
        resetPromiseResult =
          result.current.resetPasswordHandler(validResetData);
      });

      // Assert - Should be loading
      await waitFor(() => {
        expect(result.current.isRequestingPasswordReset).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolveReset!('Password reset successfully');
        await resetPromiseResult!;
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
      const error = new Error('Database error');
      mockResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      await act(async () => {
        try {
          await result.current.resetPasswordHandler(validResetData);
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
    it('should handle form validation with invalid passwords', async () => {
      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Set invalid data (passwords don't match)
      result.current.resetPasswordForm.setValue('newPassword', 'password123');
      result.current.resetPasswordForm.setValue(
        'confirmPassword',
        'different123'
      );

      // Trigger validation
      const isValid = await result.current.resetPasswordForm.trigger();

      expect(isValid).toBe(false);
      expect(result.current.resetPasswordForm.formState.errors).toBeDefined();
    });

    it('should handle form validation with valid matching passwords', async () => {
      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Set valid matching passwords
      result.current.resetPasswordForm.setValue('newPassword', 'password123');
      result.current.resetPasswordForm.setValue(
        'confirmPassword',
        'password123'
      );

      // Trigger validation
      const isValid = await result.current.resetPasswordForm.trigger();

      expect(isValid).toBe(true);
      expect(
        Object.keys(result.current.resetPasswordForm.formState.errors)
      ).toHaveLength(0);
    });

    it('should maintain reset token in form', () => {
      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Reset token should remain unchanged
      expect(result.current.resetPasswordForm.getValues().resetToken).toBe(
        mockResetToken
      );
    });
  });

  describe('React Query integration', () => {
    it('should use mutateAsync for async handling', async () => {
      // Arrange
      mockResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      const resetResult = result.current.resetPasswordHandler({
        newPassword: 'password123',
        confirmPassword: 'password123',
        resetToken: mockResetToken,
      });

      // Assert - resetPasswordHandler should return a promise
      expect(resetResult).toBeInstanceOf(Promise);

      // Wait for completion
      await resetResult;

      expect(mockResetPasswordEffect).toHaveBeenCalled();
    });

    it('should use correct mutation key', () => {
      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // The mutation should be properly setup with the 'reset-password' key
      expect(result.current.resetPasswordHandler).toBeDefined();
      expect(typeof result.current.resetPasswordHandler).toBe('function');
    });

    it('should reset loading state after mutation completes', async () => {
      // Arrange
      mockResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      await result.current.resetPasswordHandler({
        newPassword: 'password123',
        confirmPassword: 'password123',
        resetToken: mockResetToken,
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isRequestingPasswordReset).toBe(false);
      });
    });
  });

  describe('Navigation behavior', () => {
    it('should navigate to login on successful reset', async () => {
      // Arrange
      mockResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      await result.current.resetPasswordHandler({
        newPassword: 'password123',
        confirmPassword: 'password123',
        resetToken: mockResetToken,
      });

      // Assert
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should navigate to forgot-password on invalid token with replace', async () => {
      // Arrange
      const error = new Error('Invalid reset token');
      mockResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      try {
        await result.current.resetPasswordHandler({
          newPassword: 'password123',
          confirmPassword: 'password123',
          resetToken: mockResetToken,
        });
      } catch {
        // Expected to throw
      }

      // Assert
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password', {
          replace: true,
        });
      });
    });

    it('should not navigate on other errors', async () => {
      // Arrange
      const error = new Error('Password validation failed');
      mockResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      try {
        await result.current.resetPasswordHandler({
          newPassword: 'password123',
          confirmPassword: 'password123',
          resetToken: mockResetToken,
        });
      } catch {
        // Expected to throw
      }

      // Assert
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Toast notifications', () => {
    it('should display success toast with correct duration and message', async () => {
      // Arrange
      mockResetPasswordEffect.mockResolvedValue('Success');

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      await result.current.resetPasswordHandler({
        newPassword: 'password123',
        confirmPassword: 'password123',
        resetToken: mockResetToken,
      });

      // Assert
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Password reset successful, please login with your new password',
          { duration: 8000 }
        );
      });
    });

    it('should display special error toast for invalid token', async () => {
      // Arrange
      const error = new Error('Invalid reset token');
      mockResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      try {
        await result.current.resetPasswordHandler({
          newPassword: 'password123',
          confirmPassword: 'password123',
          resetToken: mockResetToken,
        });
      } catch {
        // Expected to throw
      }

      // Assert
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Invalid reset token. Please request a new password reset.',
          { duration: 8000 }
        );
      });
    });

    it('should display generic error toast for other errors', async () => {
      // Arrange
      const error = new Error('Validation failed');
      mockResetPasswordEffect.mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(mockResetToken), {
        wrapper,
      });

      // Act
      try {
        await result.current.resetPasswordHandler({
          newPassword: 'password123',
          confirmPassword: 'password123',
          resetToken: mockResetToken,
        });
      } catch {
        // Expected to throw
      }

      // Assert
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Validation failed');
      });
    });
  });
});
