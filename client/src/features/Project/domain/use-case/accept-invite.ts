import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class AcceptInviteUseCaseParams {
  public token: string;

  constructor(token: string) {
    this.token = token;
  }
}

@injectable()
export class AcceptInviteUseCase
  implements UseCase<void, AcceptInviteUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: AcceptInviteUseCaseParams
  ): Promise<Either<Failure, void>> {
    return this.projectRepository.acceptInviteToProject(params.token);
  }
}
