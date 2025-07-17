import { inject, injectable } from 'tsyringe';

import { BACKEND_URL } from '@/core/constants/env.ts';
import AxiosClient from '@/core/network/axios-client.ts';
import extractErrorMessage from '@/core/utils/extract-error-message.ts';
import UserModel from '@/features/User/data/model/user-model.ts';

@injectable()
class UserEndpoints {
  private readonly userPath = `${BACKEND_URL}/users`;

  constructor(@inject(AxiosClient) private readonly axiosClient: AxiosClient) {}

  public async getUser(): Promise<UserModel> {
    try {
      const response = await this.axiosClient
        .getInstance()
        .get(`${this.userPath}/me`);
      return response.data;
    } catch (error) {
      console.error('UserEndpoints.getUser: ', error);
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }
}

export default UserEndpoints;
