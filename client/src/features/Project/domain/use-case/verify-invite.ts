import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case';
import InviteVerificationModel from '@/features/Project/data/model/invite-verification-model.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class VerifyInviteUseCaseParams {
  public token: string;

  constructor(token: string) {
    this.token = token;
  }
}

@injectable()
export class VerifyInviteUseCase
  implements UseCase<InviteVerificationModel, VerifyInviteUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: VerifyInviteUseCaseParams
  ): Promise<Either<Failure, InviteVerificationModel>> {
    return this.projectRepository.verifyInviteToken(params.token);
  }
}
