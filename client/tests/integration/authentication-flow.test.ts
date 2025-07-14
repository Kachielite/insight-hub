import axios from 'axios';
import * as E from 'fp-ts/lib/Either';
import { container } from 'tsyringe';

import {
  LoginUseCase,
  LoginUseCaseParams,
} from '@/features/Authentication/domain/use-case/login';
import {
  RegisterUseCase,
  RegisterUseCaseParams,
} from '@/features/Authentication/domain/use-case/register';
import { configureAuthContainer } from '@/init-dependencies/auth-di';

import { testUsers } from '../fixtures/auth-fixtures';

// Mock axios for integration tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    container.clearInstances();
    configureAuthContainer();
  });

  describe('End-to-End Authentication Flow', () => {
    it('should complete full login flow with real dependencies', async () => {
      // Mock successful API response
      mockedAxios.post.mockResolvedValue({
        data: {
          accessToken: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const loginUseCase = container.resolve(LoginUseCase);
      const params = new LoginUseCaseParams({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });
      const result = await loginUseCase.execute(params);

      expect(E.isRight(result)).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        {
          email: testUsers.validUser.email,
          password: testUsers.validUser.password,
        }
      );
    });

    it('should complete full registration flow with real dependencies', async () => {
      // Mock successful registration response
      mockedAxios.post.mockResolvedValue({
        data: {
          accessToken: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const registerUseCase = container.resolve(RegisterUseCase);
      const params = new RegisterUseCaseParams({
        name: testUsers.newUser.name,
        email: testUsers.newUser.email,
        password: testUsers.newUser.password,
      });
      const result = await registerUseCase.execute(params);

      expect(E.isRight(result)).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/register'),
        {
          name: testUsers.newUser.name,
          email: testUsers.newUser.email,
          password: testUsers.newUser.password,
        }
      );
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      const loginUseCase = container.resolve(LoginUseCase);
      const params = new LoginUseCaseParams({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });
      const result = await loginUseCase.execute(params);

      expect(E.isLeft(result)).toBe(true);
    });

    it('should handle API errors with proper error mapping', async () => {
      // Mock API error response
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      });

      const loginUseCase = container.resolve(LoginUseCase);
      const params = new LoginUseCaseParams({
        email: testUsers.invalidUser.email,
        password: testUsers.invalidUser.password,
      });
      const result = await loginUseCase.execute(params);

      expect(E.isLeft(result)).toBe(true);
    });
  });
});
