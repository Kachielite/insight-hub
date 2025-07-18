import 'reflect-metadata';
import { container } from 'tsyringe';

// Import datasource classes
import type { AuthDataSource } from '@/features/Authentication/data/datasource/auth-datasource.ts';
import AuthDataSourceImpl from '@/features/Authentication/data/datasource/auth-datasource.ts';
import AuthEndpoints from '@/features/Authentication/data/datasource/network/auth.ts';
import AuthRepositoryImpl from '@/features/Authentication/data/repositories/auth-repository-impl.ts';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';
// Import use cases
import { LoginUseCase } from '@/features/Authentication/domain/use-case/login.ts';
import { RegisterUseCase } from '@/features/Authentication/domain/use-case/register.ts';
import { RequestResetPasswordUseCase } from '@/features/Authentication/domain/use-case/request-reset-password.ts';
import { ResetPasswordUseCase } from '@/features/Authentication/domain/use-case/reset-password.ts';

export function configureAuthContainer() {
  // Register network layer
  container.registerSingleton<AuthEndpoints>(AuthEndpoints);

  // Register data source
  container.register<AuthDataSource>('AuthDataSource', {
    useClass: AuthDataSourceImpl,
  });

  // Register repository
  container.register<AuthRepository>('AuthRepository', {
    useClass: AuthRepositoryImpl,
  });

  // Register use cases
  container.registerSingleton<LoginUseCase>(LoginUseCase);
  container.registerSingleton<RegisterUseCase>(RegisterUseCase);
  container.registerSingleton<RequestResetPasswordUseCase>(
    RequestResetPasswordUseCase
  );
  container.registerSingleton<ResetPasswordUseCase>(ResetPasswordUseCase);
}

// Export use case classes for manual resolution
export {
  LoginUseCase,
  RegisterUseCase,
  RequestResetPasswordUseCase,
  ResetPasswordUseCase,
};

// Helper function to get configured use cases
export function getAuthUseCases() {
  return {
    loginUseCase: container.resolve(LoginUseCase),
    registerUseCase: container.resolve(RegisterUseCase),
    requestResetPasswordUseCase: container.resolve(RequestResetPasswordUseCase),
    resetPasswordUseCase: container.resolve(ResetPasswordUseCase),
  };
}
