import AuthDataSourceImpl from '@/features/Authentication/data/datasource/auth-datasource.ts';
import AuthEndpoints from '@/features/Authentication/data/datasource/network/auth.ts';

import { mockApiResponses, testUsers } from '../../fixtures/auth-fixtures';

// Mock the network layer
const mockAuthEndpoints = {
  login: jest.fn(),
  register: jest.fn(),
  requestResetPassword: jest.fn(),
  resetPassword: jest.fn(),
} as jest.Mocked<
  Pick<
    AuthEndpoints,
    'login' | 'register' | 'requestResetPassword' | 'resetPassword'
  >
>;

describe('AuthDataSource', () => {
  let authDataSource: AuthDataSourceImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    authDataSource = new AuthDataSourceImpl(
      mockAuthEndpoints as unknown as AuthEndpoints
    );
  });

  describe('login', () => {
    it('should return user data on successful API call', async () => {
      mockAuthEndpoints.login.mockResolvedValue(mockApiResponses.loginSuccess);

      const result = await authDataSource.login({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });

      expect(result).toBeDefined();
      expect(mockAuthEndpoints.login).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });
    });

    it('should throw error on API failure', async () => {
      const apiError = new Error('Network error');
      mockAuthEndpoints.login.mockRejectedValue(apiError);

      await expect(
        authDataSource.login({
          email: testUsers.invalidUser.email,
          password: testUsers.invalidUser.password,
        })
      ).rejects.toThrow();
    });

    it('should handle 401 unauthorized error', async () => {
      const unauthorizedError = new Error('Invalid credentials');
      mockAuthEndpoints.login.mockRejectedValue(unauthorizedError);

      await expect(
        authDataSource.login({
          email: testUsers.invalidUser.email,
          password: testUsers.invalidUser.password,
        })
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should return user data on successful registration', async () => {
      mockAuthEndpoints.register.mockResolvedValue(
        mockApiResponses.registerSuccess
      );

      const result = await authDataSource.register({
        name: testUsers.newUser.name,
        email: testUsers.newUser.email,
        password: testUsers.newUser.password,
      });

      expect(result).toBeDefined();
      expect(mockAuthEndpoints.register).toHaveBeenCalledWith({
        name: testUsers.newUser.name,
        email: testUsers.newUser.email,
        password: testUsers.newUser.password,
      });
    });

    it('should handle email already exists error', async () => {
      const conflictError = new Error('Email already exists');
      mockAuthEndpoints.register.mockRejectedValue(conflictError);

      await expect(
        authDataSource.register({
          name: testUsers.newUser.name,
          email: testUsers.validUser.email,
          password: testUsers.newUser.password,
        })
      ).rejects.toThrow();
    });
  });

  describe('requestResetPassword', () => {
    it('should successfully request password reset', async () => {
      const mockResponse = 'Password reset email sent';
      mockAuthEndpoints.requestResetPassword.mockResolvedValue(mockResponse);

      const result = await authDataSource.requestResetPassword({
        email: testUsers.validUser.email,
      });

      expect(result).toBe(mockResponse);
      expect(mockAuthEndpoints.requestResetPassword).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
      });
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const mockResponse = 'Password reset successful';
      mockAuthEndpoints.resetPassword.mockResolvedValue(mockResponse);

      const result = await authDataSource.resetPassword({
        email: testUsers.validUser.email,
        resetToken: 'valid-reset-token',
        newPassword: 'newpassword123',
      });

      expect(result).toBe(mockResponse);
      expect(mockAuthEndpoints.resetPassword).toHaveBeenCalledWith({
        email: testUsers.validUser.email,
        resetToken: 'valid-reset-token',
        newPassword: 'newpassword123',
      });
    });

    it('should handle invalid token error', async () => {
      const invalidTokenError = new Error('Invalid or expired token');
      mockAuthEndpoints.resetPassword.mockRejectedValue(invalidTokenError);

      await expect(
        authDataSource.resetPassword({
          email: testUsers.validUser.email,
          resetToken: 'invalid-token',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow();
    });
  });
});
