import type { AuthLoginSchema } from '@/core/validation/auth.ts';
import { type UseCase } from '@/core/use-case/use-case.ts';
import type Auth from '@/features/Authentication/domain/entity/auth.ts';
import type { Failure } from '@/core/error/failure.ts';
import type { Either } from 'fp-ts/Either';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';
import { inject, injectable } from 'tsyringe';

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
