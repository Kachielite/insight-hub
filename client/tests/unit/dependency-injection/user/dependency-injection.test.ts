import { container } from 'tsyringe';

import type { UserDataSource } from '@/features/User/data/datasource/user-datasource.ts';
import type { UserRepository } from '@/features/User/domain/repositories/user-repository.ts';
import { GetUserUseCase } from '@/features/User/domain/use-case/get-user.ts';
import { configureUserContainer } from '@/init-dependencies/user-di.ts';

describe('User Dependency Injection', () => {
  beforeEach(() => {
    // Clear container before each test
    container.clearInstances();
    configureUserContainer();
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should register all user dependencies', () => {
    // Test that all required dependencies are registered
    expect(() => container.resolve(GetUserUseCase)).not.toThrow();
  });

  it('should resolve the same instance for singletons', () => {
    const useCase1 = container.resolve(GetUserUseCase);
    const useCase2 = container.resolve(GetUserUseCase);
    expect(useCase1).toBe(useCase2);
  });

  it('should resolve repository and data source dependencies', () => {
    expect(() =>
      container.resolve<UserRepository>('UserRepository')
    ).not.toThrow();
    expect(() =>
      container.resolve<UserDataSource>('UserDataSource')
    ).not.toThrow();
  });

  it('should properly inject dependencies into use cases', () => {
    const useCase = container.resolve(GetUserUseCase);
    expect(useCase).toBeDefined();
    expect(typeof useCase.execute).toBe('function');
  });
});
