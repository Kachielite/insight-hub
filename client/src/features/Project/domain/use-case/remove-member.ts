import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case.ts';
import { ProjectMemberAddOrRemove } from '@/core/validation/project.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class RemoveMemberUseCaseParams {
  public data: ProjectMemberAddOrRemove;

  constructor(data: ProjectMemberAddOrRemove) {
    this.data = data;
  }
}

@injectable()
export class RemoveMemberUseCase
  implements UseCase<void, RemoveMemberUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: RemoveMemberUseCaseParams
  ): Promise<Either<Failure, void>> {
    return this.projectRepository.removeMemberFromProject(params.data);
  }
}
