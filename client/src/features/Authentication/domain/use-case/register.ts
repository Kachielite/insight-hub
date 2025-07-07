import { inject, injectable } from 'tsyringe';
import type { AuthRegisterSchema } from '@/core/validation/auth.ts';
import type { UseCase } from '@/core/use-case/use-case.ts';
import type Auth from '@/features/Authentication/domain/entity/auth.ts';
import type { AuthRepository } from '@/features/Authentication/domain/repositories/auth-repository.ts';
import type { Either } from 'fp-ts/Either';
import type { Failure } from '@/core/error/failure.ts';

export class RegisterUseCaseParams {
  public data: AuthRegisterSchema;

  constructor(data: AuthRegisterSchema) {
    this.data = data;
  }
}

@injectable()
export class RegisterUseCase implements UseCase<Auth, RegisterUseCaseParams> {
  private readonly authRepository: AuthRepository;

  constructor(@inject('AuthRepository') authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(params: RegisterUseCaseParams): Promise<Either<Failure, Auth>> {
    return this.authRepository.register(params.data);
  }
}
