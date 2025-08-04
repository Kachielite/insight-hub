import * as E from 'fp-ts/lib/Either';
import { container } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { NoParams } from '@/core/use-case/use-case.ts';
import UserModel from '@/features/User/data/model/user-model.ts';
import type { UserRepository } from '@/features/User/domain/repositories/user-repository.ts';
import { GetUserUseCase } from '@/features/User/domain/use-case/get-user.ts';

import { mockUserApiResponses } from '../../../../fixtures/user-fixtures.ts';

// Mock the repository
const mockUserRepository: jest.Mocked<UserRepository> = {
  getUser: jest.fn(),
};

describe('User Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    container.registerInstance<UserRepository>(
      'UserRepository',
      mockUserRepository
    );
  });

  describe('GetUserUseCase', () => {
    it('should return Right(User) on success', async () => {
      mockUserRepository.getUser.mockResolvedValue(
        E.right(
          new UserModel(
            mockUserApiResponses.getUserSuccess.id,
            mockUserApiResponses.getUserSuccess.name,
            mockUserApiResponses.getUserSuccess.email,
            mockUserApiResponses.getUserSuccess.role,
            mockUserApiResponses.getUserSuccess.createdAt,
            mockUserApiResponses.getUserSuccess.projects
          )
        )
      );
      const useCase = container.resolve(GetUserUseCase);
      const result = await useCase.execute(new NoParams());
      expect(E.isRight(result)).toBe(true);
      expect(mockUserRepository.getUser).toHaveBeenCalled();
    });

    it('should return Left(Failure) on error', async () => {
      mockUserRepository.getUser.mockResolvedValue(
        E.left(new Failure('Network error'))
      );
      const useCase = container.resolve(GetUserUseCase);
      const result = await useCase.execute(new NoParams());
      expect(E.isLeft(result)).toBe(true);
      expect(mockUserRepository.getUser).toHaveBeenCalled();
    });
  });
});
