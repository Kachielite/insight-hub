import { inject, injectable } from 'tsyringe';

import extractErrorDatasource from '@/core/utils/extract-error-datasource.ts';
import UserEndpoints from '@/features/User/data/datasource/network/user.ts';
import UserModel from '@/features/User/data/model/user-model.ts';

export interface UserDataSource {
  getUser: () => Promise<UserModel>;
}

@injectable()
export class UserDataSourceImpl implements UserDataSource {
  private readonly userEndpoints: UserEndpoints;

  constructor(@inject(UserEndpoints) userEndpoints: UserEndpoints) {
    this.userEndpoints = userEndpoints;
  }

  async getUser(): Promise<UserModel> {
    try {
      const response = await this.userEndpoints.getUser();
      return UserModel.fromJson(response);
    } catch (error) {
      throw extractErrorDatasource(error, 'UserDataSourceImpl getUser');
    }
  }
}
