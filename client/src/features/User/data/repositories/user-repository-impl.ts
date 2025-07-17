import { Either, right } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import extractErrorRepository from '@/core/utils/extract-error-repository.ts';
import { UserDataSourceImpl } from '@/features/User/data/datasource/user-datasource.ts';

import User from '../../domain/entity/user';
import { UserRepository } from '../../domain/repositories/user-repository';

@injectable()
class UserRepositoryImpl implements UserRepository {
  constructor(
    @inject(UserDataSourceImpl)
    private readonly userDataSource: UserDataSourceImpl
  ) {}

  async getUser(): Promise<Either<Failure, User>> {
    try {
      const response = await this.userDataSource.getUser();
      return right(response);
    } catch (error) {
      return extractErrorRepository(error, 'UserRepositoryImpl getUser');
    }
  }
}

export default UserRepositoryImpl;
