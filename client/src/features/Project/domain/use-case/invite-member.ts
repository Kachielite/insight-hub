import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case.ts';
import { ProjectMemberAddOrRemove } from '@/core/validation/project.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class InviteMemberUseCaseParams {
  public data: ProjectMemberAddOrRemove;

  constructor(data: ProjectMemberAddOrRemove) {
    this.data = data;
  }
}

@injectable()
export class InviteMemberUseCase
  implements UseCase<void, InviteMemberUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: InviteMemberUseCaseParams
  ): Promise<Either<Failure, void>> {
    return this.projectRepository.inviteMemberToProject(params.data);
  }
}
