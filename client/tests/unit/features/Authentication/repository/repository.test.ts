import * as E from 'fp-ts/lib/Either';

import { ServerException } from '@/core/error/server.ts';
import AuthDataSourceImpl from '@/features/Authentication/data/datasource/auth-datasource.ts';
import AuthRepositoryImpl from '@/features/Authentication/data/repositories/auth-repository-impl.ts';

import {
  mockApiResponses,
  testUsers,
} from '../../../../fixtures/auth-fixtures.ts';

// Mock the data source
const mockAuthDataSource = {
  login: jest.fn(),
  register: jest.fn(),
  requestResetPassword: jest.fn(),
  resetPassword: jest.fn(),
} as jest.Mocked<
  Pick<
    AuthDataSourceImpl,
    'login' | 'register' | 'requestResetPassword' | 'resetPassword'
  >
>;

describe('AuthRepository', () => {
  let authRepository: AuthRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    authRepository = new AuthRepositoryImpl(
      mockAuthDataSource as unknown as AuthDataSourceImpl
    );
  });

  describe('login', () => {
    it('should return user data on successful login', async () => {
      mockAuthDataSource.login.mockResolvedValue(mockApiResponses.loginSuccess);

      const result = await authRepository.login({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockApiResponses.loginSuccess);
      }
      expect(mockAuthDataSource.login).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });
    });

    it('should return error on failed login', async () => {
      const error = new ServerException('Invalid credentials');
      mockAuthDataSource.login.mockRejectedValue(error);

      const result = await authRepository.login({
        email: testUsers.invalidUser.email,
        password: testUsers.invalidUser.password,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe('Invalid credentials');
      }
    });

    it('should handle unknown errors', async () => {
      const error = new Error('Network error');
      mockAuthDataSource.login.mockRejectedValue(error);

      const result = await authRepository.login({
        email: testUsers.invalidUser.email,
        password: testUsers.invalidUser.password,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe('An unknown error occurred');
      }
    });
  });

  describe('register', () => {
    it('should return user data on successful registration', async () => {
      mockAuthDataSource.register.mockResolvedValue(
        mockApiResponses.registerSuccess
      );

      const result = await authRepository.register({
        name: testUsers.newUser.name,
        email: testUsers.newUser.email,
        password: testUsers.newUser.password,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockApiResponses.registerSuccess);
      }
      expect(mockAuthDataSource.register).toHaveBeenCalledWith({
        name: testUsers.newUser.name,
        email: testUsers.newUser.email,
        password: testUsers.newUser.password,
      });
    });

    it('should return error when email already exists', async () => {
      const error = new ServerException('Email already exists');
      mockAuthDataSource.register.mockRejectedValue(error);

      const result = await authRepository.register({
        name: testUsers.newUser.name,
        email: testUsers.validUser.email,
        password: testUsers.newUser.password,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe('Email already exists');
      }
    });
  });

  describe('requestResetPassword', () => {
    it('should successfully request password reset', async () => {
      const mockResponse = 'Password reset email sent';
      mockAuthDataSource.requestResetPassword.mockResolvedValue(mockResponse);

      const result = await authRepository.requestResetPassword({
        email: testUsers.validUser.email,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(mockResponse);
      }
      expect(mockAuthDataSource.requestResetPassword).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
      });
    });

    it('should handle request reset password error', async () => {
      const error = new ServerException('User not found');
      mockAuthDataSource.requestResetPassword.mockRejectedValue(error);

      const result = await authRepository.requestResetPassword({
        email: testUsers.invalidUser.email,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe('User not found');
      }
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const mockResponse = 'Password reset successful';
      mockAuthDataSource.resetPassword.mockResolvedValue(mockResponse);

      const result = await authRepository.resetPassword({
        resetToken: 'valid-reset-token',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(mockResponse);
      }
      expect(mockAuthDataSource.resetPassword).toHaveBeenCalledWith({
        resetToken: 'valid-reset-token',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });
    });

    it('should handle invalid reset token error', async () => {
      const error = new ServerException('Invalid or expired token');
      mockAuthDataSource.resetPassword.mockRejectedValue(error);

      const result = await authRepository.resetPassword({
        resetToken: 'valid-reset-token',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe('Invalid or expired token');
      }
    });
  });
});
