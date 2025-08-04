import UserEndpoints from '@/features/User/data/datasource/network/user.ts';
import { UserDataSourceImpl } from '@/features/User/data/datasource/user-datasource.ts';
import UserModel from '@/features/User/data/model/user-model.ts';

import { mockUserApiResponses } from '../../../../fixtures/user-fixtures.ts';

// Mock the network layer
const mockUserEndpoints = {
  getUser: jest.fn(),
} as jest.Mocked<Pick<UserEndpoints, 'getUser'>>;

describe('UserDataSource', () => {
  let userDataSource: UserDataSourceImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    userDataSource = new UserDataSourceImpl(
      mockUserEndpoints as unknown as UserEndpoints
    );
  });

  describe('getUser', () => {
    it('should return user data on successful API call', async () => {
      mockUserEndpoints.getUser.mockResolvedValue(
        mockUserApiResponses.getUserSuccess
      );

      const result = await userDataSource.getUser();

      expect(result).toBeInstanceOf(UserModel);
      expect(mockUserEndpoints.getUser).toHaveBeenCalled();
    });

    it('should throw error on API failure', async () => {
      const apiError = new Error('Network error');
      mockUserEndpoints.getUser.mockRejectedValue(apiError);

      await expect(userDataSource.getUser()).rejects.toThrow();
    });
  });
});
