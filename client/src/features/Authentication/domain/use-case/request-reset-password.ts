import { inject, injectable } from 'tsyringe';

import type { Failure } from '@/core/error/failure.ts';
import type { UseCase } from '@/core/use-case/use-case.ts';
import type { AuthRequestResetPasswordSchema } from '@/core/validation/auth.ts';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';

import type { Either } from 'fp-ts/Either';

export class RequestResetPasswordUseCaseParams {
  public readonly data: AuthRequestResetPasswordSchema;
  constructor(data: AuthRequestResetPasswordSchema) {
    this.data = data;
  }
}

@injectable()
export class RequestResetPasswordUseCase
  implements UseCase<string, RequestResetPasswordUseCaseParams>
{
  private readonly authRepository: AuthRepository;

  constructor(@inject('AuthRepository') authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(
    params: RequestResetPasswordUseCaseParams
  ): Promise<Either<Failure, string>> {
    return await this.authRepository.requestResetPassword(params.data);
  }
}
