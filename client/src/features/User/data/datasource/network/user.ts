import { inject, injectable } from 'tsyringe';

import { BACKEND_URL } from '@/core/constants/env.ts';
import extractErrorEndpoints from '@/core/utils/extract-error-endpoints.ts';
import UserModel from '@/features/User/data/model/user-model.ts';

import type { AxiosInstance } from 'axios';

@injectable()
class UserEndpoints {
  private readonly userPath = `${BACKEND_URL}/users`;

  constructor(
    @inject('axiosClient') private readonly axiosClient: AxiosInstance
  ) {}

  public async getUser(): Promise<UserModel> {
    try {
      const response = await this.axiosClient.get(`${this.userPath}/me`);
      return response.data;
    } catch (error) {
      console.error('UserEndpoints.getUser: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }
}

export default UserEndpoints;
