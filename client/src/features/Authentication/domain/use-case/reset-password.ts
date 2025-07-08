import { inject, injectable } from 'tsyringe';

import type { Failure } from '@/core/error/failure.ts';
import type { UseCase } from '@/core/use-case/use-case.ts';
import type { AuthResetSchema } from '@/core/validation/auth.ts';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';

import type { Either } from 'fp-ts/Either';

export class ResetPasswordUseCaseParams {
  public data: AuthResetSchema;
  constructor(data: AuthResetSchema) {
    this.data = data;
  }
}

@injectable()
export class ResetPasswordUseCase
  implements UseCase<string, ResetPasswordUseCaseParams>
{
  private readonly authRepository: AuthRepository;

  constructor(@inject('AuthRepository') authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(
    params: ResetPasswordUseCaseParams
  ): Promise<Either<Failure, string>> {
    return await this.authRepository.resetPassword(params.data);
  }
}
