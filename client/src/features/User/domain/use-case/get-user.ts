import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { NoParams, UseCase } from '@/core/use-case/use-case.ts';
import User from '@/features/User/domain/entity/user.ts';
import { UserRepository } from '@/features/User/domain/repositories/user-repository.ts';

@injectable()
export class GetUserUseCase implements UseCase<User, NoParams> {
  constructor(
    @inject('UserRepository') private readonly userRepository: UserRepository
  ) {}

  async execute(_params: NoParams): Promise<Either<Failure, User>> {
    return this.userRepository.getUser();
  }
}
