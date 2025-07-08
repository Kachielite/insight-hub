import { type Either, left, right } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { ServerException } from '@/core/error/server.ts';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthRequestResetPasswordSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import AuthDataSource from '@/features/Authentication/data/datasource/auth-datasource.ts';
import type Auth from '@/features/Authentication/domain/entity/auth.ts';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';

@injectable()
class AuthRepositoryImpl implements AuthRepository {
  private readonly authDataSource: AuthDataSource;

  constructor(@inject(AuthDataSource) authDataSource: AuthDataSource) {
    this.authDataSource = authDataSource;
  }
  async login(data: AuthLoginSchema): Promise<Either<Failure, Auth>> {
    try {
      const response = await this.authDataSource.login(data);
      return right(response);
    } catch (error) {
      console.error('AuthRepositoryImpl login:', error);
      const errorMessage =
        error instanceof ServerException
          ? error.message
          : 'An unknown error occurred';
      return left(new Failure(errorMessage));
    }
  }

  async register(data: AuthRegisterSchema): Promise<Either<Failure, Auth>> {
    try {
      const response = await this.authDataSource.register(data);
      return right(response);
    } catch (error) {
      console.error('AuthRepositoryImpl register:', error);
      const errorMessage =
        error instanceof ServerException
          ? error.message
          : 'An unknown error occurred';
      return left(new Failure(errorMessage));
    }
  }

  async requestResetPassword(
    data: AuthRequestResetPasswordSchema
  ): Promise<Either<Failure, string>> {
    try {
      const response = await this.authDataSource.requestResetPassword(data);
      return right(response);
    } catch (error) {
      console.error('AuthRepositoryImpl requestResetPassword:', error);
      const errorMessage =
        error instanceof ServerException
          ? error.message
          : 'An unknown error occurred';
      return left(new Failure(errorMessage));
    }
  }

  async resetPassword(data: AuthResetSchema): Promise<Either<Failure, string>> {
    try {
      const response = await this.authDataSource.resetPassword(data);
      return right(response);
    } catch (error) {
      console.error('AuthRepositoryImpl resetPassword:', error);
      const errorMessage =
        error instanceof ServerException
          ? error.message
          : 'An unknown error occurred';
      return left(new Failure(errorMessage));
    }
  }
}

export default AuthRepositoryImpl;
