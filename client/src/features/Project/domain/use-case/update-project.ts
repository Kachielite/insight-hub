import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case.ts';
import { ProjectUpdateSchema } from '@/core/validation/project.ts';
import Project from '@/features/Project/domain/entity/project.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class UpdateProjectUseCaseParams {
  public projectData: ProjectUpdateSchema;

  constructor(projectData: ProjectUpdateSchema) {
    this.projectData = projectData;
  }
}

@injectable()
export class UpdateProjectUseCase
  implements UseCase<Project, UpdateProjectUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: UpdateProjectUseCaseParams
  ): Promise<Either<Failure, Project>> {
    return this.projectRepository.updateProject(params.projectData);
  }
}
