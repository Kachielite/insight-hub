import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import AuthModel from '@/features/Authentication/data/model/auth-model.ts';
import { inject, injectable } from 'tsyringe';
import AuthEndpoints from '@/features/Authentication/data/datasource/network/auth.ts';
import { ServerException } from '@/core/error/server.ts';

export interface AuthDataSource {
  login(data: AuthLoginSchema): Promise<AuthModel>;
  register(data: AuthRegisterSchema): Promise<AuthModel>;
  requestResetPassword(email: string): Promise<string>;
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

  requestResetPassword(email: string): Promise<string> {
    try {
      return this.authEndpoints.requestResetPassword(email);
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
