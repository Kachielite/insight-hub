import { inject, injectable } from 'tsyringe';

import { ServerException } from '@/core/error/server.ts';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthRequestResetPasswordSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import AuthEndpoints from '@/features/Authentication/data/datasource/network/auth.ts';
import AuthModel from '@/features/Authentication/data/model/auth-model.ts';

export interface AuthDataSource {
  login(data: AuthLoginSchema): Promise<AuthModel>;
  register(data: AuthRegisterSchema): Promise<AuthModel>;
  requestResetPassword(data: AuthRequestResetPasswordSchema): Promise<string>;
  resetPassword(data: AuthResetSchema): Promise<string>;
}

@injectable()
class AuthDataSourceImpl implements AuthDataSource {
  private readonly authEndpoints: AuthEndpoints;

  constructor(@inject(AuthEndpoints) authEndpoints: AuthEndpoints) {
    this.authEndpoints = authEndpoints;
  }

  async login(data: AuthLoginSchema): Promise<AuthModel> {
    try {
      const response = await this.authEndpoints.login(data);
      return AuthModel.fromJson(response);
    } catch (error) {
      throw this.extractErrorMessage(error, 'AuthDatasourceImpl login');
    }
  }

  async register(data: AuthRegisterSchema): Promise<AuthModel> {
    try {
      const response = await this.authEndpoints.register(data);
      return AuthModel.fromJson(response);
    } catch (error) {
      throw this.extractErrorMessage(error, 'AuthDatasourceImpl register');
    }
  }

  requestResetPassword(data: AuthRequestResetPasswordSchema): Promise<string> {
    try {
      return this.authEndpoints.requestResetPassword(data);
    } catch (error) {
      throw this.extractErrorMessage(
        error,
        'AuthDatasourceImpl requestResetPassword'
      );
    }
  }

  resetPassword(data: AuthResetSchema): Promise<string> {
    try {
      return this.authEndpoints.resetPassword(data);
    } catch (error) {
      throw this.extractErrorMessage(error, 'AuthDatasourceImpl resetPassword');
    }
  }

  private extractErrorMessage(error: unknown, handlerName: string): never {
    if (error instanceof ServerException) {
      console.error(`${handlerName}: ${error.message}`);
      throw error; // Re-throw the original ServerException
    }

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`${handlerName}: ${errorMessage}`);
    throw new ServerException(errorMessage);
  }
}

export default AuthDataSourceImpl;
