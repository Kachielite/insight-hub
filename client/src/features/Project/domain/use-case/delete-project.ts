import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class DeleteProjectUseCaseParams {
  public projectId: number;

  constructor(projectId: number) {
    this.projectId = projectId;
  }
}

@injectable()
export class DeleteProjectUseCase
  implements UseCase<void, DeleteProjectUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: DeleteProjectUseCaseParams
  ): Promise<Either<Failure, void>> {
    return this.projectRepository.deleteProject(params.projectId);
  }
}
