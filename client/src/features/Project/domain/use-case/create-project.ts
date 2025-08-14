import { Either } from 'fp-ts/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure.ts';
import { UseCase } from '@/core/use-case/use-case.ts';
import { ProjectCreateSchema } from '@/core/validation/project.ts';
import Project from '@/features/Project/domain/entity/project.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

export class CreateProjectUseCaseParams {
  public projectData: ProjectCreateSchema;

  constructor(projectData: ProjectCreateSchema) {
    this.projectData = projectData;
  }
}

@injectable()
export class CreateProjectUseCase
  implements UseCase<Project, CreateProjectUseCaseParams>
{
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(
    params: CreateProjectUseCaseParams
  ): Promise<Either<Failure, Project>> {
    return this.projectRepository.createProject(params.projectData);
  }
}
