import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import * as E from 'fp-ts/Either';

import type { Failure } from '@/core/error/failure';
import Encrypter from '@/core/utils/encrypter';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthRequestResetPasswordSchema,
  AuthResetSchema,
} from '@/core/validation/auth';
import type Auth from '@/features/Authentication/domain/entity/auth';
import {
  loginEffect,
  registerEffect,
  requestResetPasswordEffect,
  resetPasswordEffect,
} from '@/features/Authentication/presentation/state/store/effects';
import { getAuthUseCases } from '@/init-dependencies/auth-di';

// Mock dependencies
jest.mock('@/core/utils/encrypter');
jest.mock('@/init-dependencies/auth-di');

const mockEncrypter = Encrypter as jest.Mocked<typeof Encrypter>;
const mockGetAuthUseCases = getAuthUseCases as jest.MockedFunction<
  typeof getAuthUseCases
>;

describe('Authentication Effects', () => {
  const mockAuth: Auth = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockFailure: Failure = {
    message: 'Test error message',
  };

  const mockLoginUseCase = {
    execute: jest.fn<() => Promise<any>>(),
  };

  const mockRegisterUseCase = {
    execute: jest.fn<() => Promise<any>>(),
  };

  const mockRequestResetPasswordUseCase = {
    execute: jest.fn<() => Promise<any>>(),
  };

  const mockResetPasswordUseCase = {
    execute: jest.fn<() => Promise<any>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAuthUseCases.mockReturnValue({
      loginUseCase: mockLoginUseCase,
      registerUseCase: mockRegisterUseCase,
      requestResetPasswordUseCase: mockRequestResetPasswordUseCase,
      resetPasswordUseCase: mockResetPasswordUseCase,
    } as any);

    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loginEffect', () => {
    const loginData: AuthLoginSchema = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should handle successful login', async () => {
      // Arrange
      mockLoginUseCase.execute.mockResolvedValue(E.right(mockAuth));

      // Act
      const result = await loginEffect(loginData);

      // Assert
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        data: loginData,
      });
      expect(mockEncrypter.setUserToken).toHaveBeenCalledWith(
        mockAuth.accessToken
      );
      expect(result).toEqual(mockAuth);
    });

    it('should handle failed login', async () => {
      // Arrange
      mockLoginUseCase.execute.mockResolvedValue(E.left(mockFailure));

      // Act & Assert
      await expect(loginEffect(loginData)).rejects.toThrow(mockFailure.message);
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        data: loginData,
      });
      expect(mockEncrypter.setUserToken).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('loginEffect:', mockFailure);
    });

    it('should handle use case execution error', async () => {
      // Arrange
      const error = new Error('Network error');
      mockLoginUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(loginEffect(loginData)).rejects.toThrow('Network error');
      expect(mockEncrypter.setUserToken).not.toHaveBeenCalled();
    });
  });

  describe('registerEffect', () => {
    const registerData: AuthRegisterSchema = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should handle successful registration', async () => {
      // Arrange
      mockRegisterUseCase.execute.mockResolvedValue(E.right(mockAuth));

      // Act
      const result = await registerEffect(registerData);

      // Assert
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        data: registerData,
      });
      expect(mockEncrypter.setUserToken).toHaveBeenCalledWith(
        mockAuth.accessToken
      );
      expect(result).toEqual(mockAuth);
    });

    it('should handle failed registration', async () => {
      // Arrange
      mockRegisterUseCase.execute.mockResolvedValue(E.left(mockFailure));

      // Act & Assert
      await expect(registerEffect(registerData)).rejects.toThrow(
        mockFailure.message
      );
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        data: registerData,
      });
      expect(mockEncrypter.setUserToken).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'registerEffect:',
        mockFailure
      );
    });

    it('should handle use case execution error', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRegisterUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(registerEffect(registerData)).rejects.toThrow(
        'Database error'
      );
      expect(mockEncrypter.setUserToken).not.toHaveBeenCalled();
    });
  });

  describe('requestResetPasswordEffect', () => {
    const requestResetData: AuthRequestResetPasswordSchema = {
      email: 'test@example.com',
    };

    it('should handle successful password reset request', async () => {
      // Arrange
      const successMessage = 'Reset email sent';
      mockRequestResetPasswordUseCase.execute.mockResolvedValue(
        E.right(successMessage)
      );

      // Act
      const result = await requestResetPasswordEffect(requestResetData);

      // Assert
      expect(mockRequestResetPasswordUseCase.execute).toHaveBeenCalledWith({
        data: requestResetData,
      });
      expect(result).toEqual(successMessage);
    });

    it('should handle failed password reset request', async () => {
      // Arrange
      mockRequestResetPasswordUseCase.execute.mockResolvedValue(
        E.left(mockFailure)
      );

      // Act & Assert
      await expect(
        requestResetPasswordEffect(requestResetData)
      ).rejects.toThrow(mockFailure.message);
      expect(mockRequestResetPasswordUseCase.execute).toHaveBeenCalledWith({
        data: requestResetData,
      });
      expect(console.error).toHaveBeenCalledWith(
        'requestResetPasswordEffect:',
        mockFailure
      );
    });

    it('should handle use case execution error', async () => {
      // Arrange
      const error = new Error('Email service error');
      mockRequestResetPasswordUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(
        requestResetPasswordEffect(requestResetData)
      ).rejects.toThrow('Email service error');
    });
  });

  describe('resetPasswordEffect', () => {
    const resetData: AuthResetSchema = {
      resetToken: 'reset-token',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };

    it('should handle successful password reset', async () => {
      // Arrange
      const successMessage = 'Password reset successfully';
      mockResetPasswordUseCase.execute.mockResolvedValue(
        E.right(successMessage)
      );

      // Act
      const result = await resetPasswordEffect(resetData);

      // Assert
      expect(mockResetPasswordUseCase.execute).toHaveBeenCalledWith({
        data: resetData,
      });
      expect(result).toEqual(successMessage);
    });

    it('should handle failed password reset', async () => {
      // Arrange
      mockResetPasswordUseCase.execute.mockResolvedValue(E.left(mockFailure));

      // Act & Assert
      await expect(resetPasswordEffect(resetData)).rejects.toThrow(
        mockFailure.message
      );
      expect(mockResetPasswordUseCase.execute).toHaveBeenCalledWith({
        data: resetData,
      });
      expect(console.error).toHaveBeenCalledWith(
        'requestResetPasswordEffect:',
        mockFailure
      );
    });

    it('should handle use case execution error', async () => {
      // Arrange
      const error = new Error('Token validation error');
      mockResetPasswordUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(resetPasswordEffect(resetData)).rejects.toThrow(
        'Token validation error'
      );
    });
  });
});
