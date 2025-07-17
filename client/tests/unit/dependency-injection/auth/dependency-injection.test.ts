import { container } from 'tsyringe';

import type { AuthDataSource } from '@/features/Authentication/data/datasource/auth-datasource.ts';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';
import { LoginUseCase } from '@/features/Authentication/domain/use-case/login.ts';
import { RegisterUseCase } from '@/features/Authentication/domain/use-case/register.ts';
import { RequestResetPasswordUseCase } from '@/features/Authentication/domain/use-case/request-reset-password.ts';
import { ResetPasswordUseCase } from '@/features/Authentication/domain/use-case/reset-password.ts';
import { configureAuthContainer } from '@/init-dependencies/auth-di.ts';

describe('Authentication Dependency Injection', () => {
  beforeEach(() => {
    // Clear container before each test
    container.clearInstances();
    configureAuthContainer();
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should register all authentication dependencies', () => {
    // Test that all required dependencies are registered
    expect(() => container.resolve(LoginUseCase)).not.toThrow();
    expect(() => container.resolve(RegisterUseCase)).not.toThrow();
    expect(() => container.resolve(RequestResetPasswordUseCase)).not.toThrow();
    expect(() => container.resolve(ResetPasswordUseCase)).not.toThrow();
  });

  it('should resolve the same instance for singletons', () => {
    const loginUseCase1 = container.resolve(LoginUseCase);
    const loginUseCase2 = container.resolve(LoginUseCase);

    expect(loginUseCase1).toBe(loginUseCase2);
  });

  it('should resolve repository and data source dependencies', () => {
    expect(() =>
      container.resolve<AuthRepository>('AuthRepository')
    ).not.toThrow();
    expect(() =>
      container.resolve<AuthDataSource>('AuthDataSource')
    ).not.toThrow();
  });

  it('should properly inject dependencies into use cases', () => {
    const loginUseCase = container.resolve(LoginUseCase);

    // Verify the use case has been properly instantiated
    expect(loginUseCase).toBeDefined();
    expect(typeof loginUseCase.execute).toBe('function');
  });
});
