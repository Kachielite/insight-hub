import { inject, injectable } from 'tsyringe';

import type { Failure } from '@/core/error/failure';
import { type UseCase } from '@/core/use-case/use-case';
import type { AuthLoginSchema } from '@/core/validation/auth';
import type Auth from '@/features/Authentication/domain/entity/auth';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository';

import type { Either } from 'fp-ts/Either';

export class LoginUseCaseParams {
  public data: AuthLoginSchema;

  constructor(data: AuthLoginSchema) {
    this.data = data;
  }
}

@injectable()
export class LoginUseCase implements UseCase<Auth, LoginUseCaseParams> {
  private readonly authRepository: AuthRepository;

  constructor(@inject('AuthRepository') authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(params: LoginUseCaseParams): Promise<Either<Failure, Auth>> {
    return this.authRepository.login(params.data);
  }
}
