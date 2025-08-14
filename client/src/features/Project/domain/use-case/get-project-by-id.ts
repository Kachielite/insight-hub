import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case.ts';
import Project from '@/features/Project/domain/entity/project.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class GetProjectByIdUseCaseParams {
  public projectId: number;

  constructor(projectId: number) {
    this.projectId = projectId;
  }
}

@injectable()
export class GetProjectByIdUseCase
  implements UseCase<Project, GetProjectByIdUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: GetProjectByIdUseCaseParams
  ): Promise<Either<Failure, Project>> {
    return this.projectRepository.getProjectById(params.projectId);
  }
}
