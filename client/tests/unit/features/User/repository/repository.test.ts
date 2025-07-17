import * as E from 'fp-ts/lib/Either';

import { Failure } from '@/core/error/failure.ts';
import UserModel from '@/features/User/data/model/user-model.ts';
import UserRepositoryImpl from '@/features/User/data/repositories/user-repository-impl.ts';

import { mockUserApiResponses } from '../../../../fixtures/user-fixtures.ts';

// Mock the data source
const mockUserDataSource = {
  getUser: jest.fn(),
} as jest.Mocked<Pick<any, 'getUser'>>;

describe('UserRepository', () => {
  let userRepository: UserRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepositoryImpl(mockUserDataSource as any);
  });

  describe('getUser', () => {
    it('should return Right(User) on success', async () => {
      mockUserDataSource.getUser.mockResolvedValue(
        new UserModel(
          mockUserApiResponses.getUserSuccess.id,
          mockUserApiResponses.getUserSuccess.name,
          mockUserApiResponses.getUserSuccess.email,
          mockUserApiResponses.getUserSuccess.role,
          mockUserApiResponses.getUserSuccess.createdAt,
          mockUserApiResponses.getUserSuccess.projects
        )
      );
      const result = await userRepository.getUser();
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBeInstanceOf(UserModel);
      }
      expect(mockUserDataSource.getUser).toHaveBeenCalled();
    });

    it('should return Left(Failure) on error', async () => {
      mockUserDataSource.getUser.mockRejectedValue(new Error('Network error'));
      const result = await userRepository.getUser();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(Failure);
      }
    });
  });
});
