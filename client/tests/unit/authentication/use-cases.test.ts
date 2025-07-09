import * as E from 'fp-ts/lib/Either';
import { container } from 'tsyringe';

import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';
import {
  LoginUseCase,
  LoginUseCaseParams,
} from '@/features/Authentication/domain/use-case/login.ts';
import {
  RegisterUseCase,
  RegisterUseCaseParams,
} from '@/features/Authentication/domain/use-case/register.ts';
import {
  RequestResetPasswordUseCase,
  RequestResetPasswordUseCaseParams,
} from '@/features/Authentication/domain/use-case/request-reset-password.ts';
import {
  ResetPasswordUseCase,
  ResetPasswordUseCaseParams,
} from '@/features/Authentication/domain/use-case/reset-password.ts';

import { mockApiResponses, testUsers } from '../../fixtures/auth-fixtures';

// Mock the repository
const mockAuthRepository: jest.Mocked<AuthRepository> = {
  login: jest.fn(),
  register: jest.fn(),
  requestResetPassword: jest.fn(),
  resetPassword: jest.fn(),
};

describe('Authentication Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Register mock repository
    container.registerInstance<AuthRepository>(
      'AuthRepository',
      mockAuthRepository
    );
  });

  describe('LoginUseCase', () => {
    it('should successfully login with valid credentials', async () => {
      mockAuthRepository.login.mockResolvedValue(
        E.right(mockApiResponses.loginSuccess)
      );

      const loginUseCase = container.resolve(LoginUseCase);
      const params = new LoginUseCaseParams({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });
      const result = await loginUseCase.execute(params);

      expect(E.isRight(result)).toBe(true);
      expect(mockAuthRepository.login).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });
    });

    it('should return error for invalid credentials', async () => {
      const mockError = new Error('Invalid credentials');
      mockAuthRepository.login.mockResolvedValue(E.left(mockError));

      const loginUseCase = container.resolve(LoginUseCase);
      const params = new LoginUseCaseParams({
        email: testUsers.invalidUser.email,
        password: testUsers.invalidUser.password,
      });
      const result = await loginUseCase.execute(params);

      expect(E.isLeft(result)).toBe(true);
      expect(mockAuthRepository.login).toHaveBeenCalledWith({
        email: testUsers.invalidUser.email,
        password: testUsers.invalidUser.password,
      });
    });
  });

  describe('RegisterUseCase', () => {
    it('should successfully register new user', async () => {
      mockAuthRepository.register.mockResolvedValue(
        E.right(mockApiResponses.registerSuccess)
      );

      const registerUseCase = container.resolve(RegisterUseCase);
      const params = new RegisterUseCaseParams({
        name: testUsers.newUser.name,
        email: testUsers.newUser.email,
        password: testUsers.newUser.password,
      });
      const result = await registerUseCase.execute(params);

      expect(E.isRight(result)).toBe(true);
      expect(mockAuthRepository.register).toHaveBeenCalledWith({
        name: testUsers.newUser.name,
        email: testUsers.newUser.email,
        password: testUsers.newUser.password,
      });
    });

    it('should return error for duplicate email', async () => {
      const mockError = new Error('Email already exists');
      mockAuthRepository.register.mockResolvedValue(E.left(mockError));

      const registerUseCase = container.resolve(RegisterUseCase);
      const params = new RegisterUseCaseParams({
        name: testUsers.newUser.name,
        email: testUsers.validUser.email, // Using existing email
        password: testUsers.newUser.password,
      });
      const result = await registerUseCase.execute(params);

      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe('RequestResetPasswordUseCase', () => {
    it('should successfully request password reset', async () => {
      const mockResponse = 'Password reset email sent';
      mockAuthRepository.requestResetPassword.mockResolvedValue(
        E.right(mockResponse)
      );

      const requestResetPasswordUseCase = container.resolve(
        RequestResetPasswordUseCase
      );
      const params = new RequestResetPasswordUseCaseParams({
        email: testUsers.validUser.email,
      });
      const result = await requestResetPasswordUseCase.execute(params);

      expect(E.isRight(result)).toBe(true);
      expect(mockAuthRepository.requestResetPassword).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
      });
    });
  });

  describe('ResetPasswordUseCase', () => {
    it('should successfully reset password', async () => {
      const mockResponse = 'Password reset successful';
      mockAuthRepository.resetPassword.mockResolvedValue(E.right(mockResponse));

      const resetPasswordUseCase = container.resolve(ResetPasswordUseCase);
      const params = new ResetPasswordUseCaseParams({
        email: testUsers.validUser.email,
        resetToken: 'reset-token',
        newPassword: 'newpassword123',
      });
      const result = await resetPasswordUseCase.execute(params);

      expect(E.isRight(result)).toBe(true);
      expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
        resetToken: 'reset-token',
        newPassword: 'newpassword123',
      });
    });
  });
});
