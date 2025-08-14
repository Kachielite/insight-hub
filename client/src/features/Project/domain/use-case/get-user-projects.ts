import { Either } from 'fp-ts/lib/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure';
import { NoParams, UseCase } from '@/core/use-case/use-case.ts';
import Project from '@/features/Project/domain/entity/project.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

@injectable()
export class GetUserProjectsUseCase implements UseCase<Project[], NoParams> {
  private readonly projectRepository: ProjectRepository;

  constructor(
    @inject('ProjectRepository') projectRepository: ProjectRepository
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(_params: NoParams): Promise<Either<Failure, Project[]>> {
    return this.projectRepository.getUserProjects();
  }
}
