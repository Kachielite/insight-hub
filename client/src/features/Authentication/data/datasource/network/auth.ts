import axios, { AxiosError } from 'axios';
import { injectable } from 'tsyringe';

import { BACKEND_URL } from '@/core/constants/env.ts';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthRequestResetPasswordSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import type AuthModel from '@/features/Authentication/data/model/auth-model.ts';

@injectable()
class AuthEndpoints {
  private readonly authPath = `${BACKEND_URL}/auth`;

  public async login(data: AuthLoginSchema): Promise<AuthModel> {
    try {
      const response = await axios.post(`${this.authPath}/login`, {
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      console.error('AuthEndpoints.login: ', error);
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  public async register(data: AuthRegisterSchema): Promise<AuthModel> {
    try {
      const response = await axios.post(`${this.authPath}/register`, {
        email: data.email,
        password: data.password,
        name: data.name,
      });
      return response.data;
    } catch (error) {
      console.error('AuthEndpoints.register: ', error);
      const errorMessage = this.extractErrorMessage(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  public async requestResetPassword(
    data: AuthRequestResetPasswordSchema
  ): Promise<string> {
    try {
      const response = await axios.get(
        `${this.authPath}/reset-password-link?email=${data.email}`
      );
      return response.data.message;
    } catch (error) {
      console.error('AuthEndpoints.requestResetPassword: ', error);
      const errorMessage = this.extractErrorMessage(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  public async resetPassword(data: AuthResetSchema): Promise<string> {
    try {
      const response = await axios.post(`${this.authPath}/reset-password`, {
        newPassword: data.newPassword,
        resetToken: data.resetToken,
      });
      return response.data.message;
    } catch (error) {
      console.error('AuthEndpoints.resetPassword: ', error);
      const errorMessage = this.extractErrorMessage(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  // TODO: refactor this method to the utility function: extractErrorEndpoints
  private extractErrorMessage(error: unknown): string {
    return error instanceof AxiosError
      ? error.response?.data?.message
      : 'An unknown error occurred';
  }
}

export default AuthEndpoints;
