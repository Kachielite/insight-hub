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
      console.error('AuthDatasourceImpl login:', error);
      throw new ServerException(
        typeof error === 'string' ? error : 'An unknown error occurred'
      );
    }
  }

  async register(data: AuthRegisterSchema): Promise<AuthModel> {
    try {
      const response = await this.authEndpoints.register(data);
      return AuthModel.fromJson(response);
    } catch (error) {
      console.error('AuthDatasourceImpl register:', error);
      throw new ServerException(
        typeof error === 'string' ? error : 'An unknown error occurred'
      );
    }
  }

  requestResetPassword(data: AuthRequestResetPasswordSchema): Promise<string> {
    try {
      return this.authEndpoints.requestResetPassword(data);
    } catch (error) {
      console.error('AuthDatasourceImpl requestResetPassword:', error);
      throw new ServerException(
        typeof error === 'string' ? error : 'An unknown error occurred'
      );
    }
  }

  resetPassword(data: AuthResetSchema): Promise<string> {
    try {
      return this.authEndpoints.resetPassword(data);
    } catch (error) {
      console.error('AuthDatasourceImpl resetPassword:', error);
      throw new ServerException(
        typeof error === 'string' ? error : 'An unknown error occurred'
      );
    }
  }
}

export default AuthDataSourceImpl;
