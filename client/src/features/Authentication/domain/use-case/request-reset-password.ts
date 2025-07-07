import type { UseCase } from '@/core/use-case/use-case.ts';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';
import { inject } from 'tsyringe';
import type { Either } from 'fp-ts/Either';
import type { Failure } from '@/core/error/failure.ts';

export class RequestResetPasswordUseCaseParams {
  public readonly email: string;
  constructor(email: string) {
    this.email = email;
  }
}

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
    return await this.authRepository.requestResetPassword(params.email);
  }
}
