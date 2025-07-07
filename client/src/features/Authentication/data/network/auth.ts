import axios, { AxiosError } from 'axios';
import AxiosClient from '../../../../core/network/axios-client.ts';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import type AuthEntity from '@/features/Authentication/data/model/auth-entity.ts';

class Auth {
  private readonly axios: AxiosClient;
  private readonly authPath = '/auth';

  constructor(axios: AxiosClient) {
    this.axios = axios;
  }

  public async login(data: AuthLoginSchema): Promise<AuthEntity> {
    try {
      const response = await axios.post(`${this.authPath}/login`, {
        email: data.email,
        password: data.password,
      });
      return response.data.data;
    } catch (error) {
      console.error('AuthEndpoints.login: ', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message
          : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  public async register(data: AuthRegisterSchema): Promise<AuthEntity> {
    try {
      const response = await axios.post(`${this.authPath}/register`, {
        email: data.email,
        password: data.password,
        name: data.name,
      });
      return response.data.data;
    } catch (error) {
      console.error('AuthEndpoints.register: ', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message
          : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  public async requestResetPassword(email: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.authPath}/reset-password-link?email=${email}`
      );
      return response.data.message;
    } catch (error) {
      console.error('AuthEndpoints.requestResetPassword: ', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message
          : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  public async resetPassword(data: AuthResetSchema): Promise<string> {
    try {
      const response = await this.axios
        .getInstance()
        .post(`${this.authPath}/reset-password`, data);
      return response.data.message;
    } catch (error) {
      console.error('AuthEndpoints.resetPassword: ', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message
          : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }
}

export default Auth;
