import { Either, right } from 'fp-ts/lib/Either';
import { inject, injectable } from 'tsyringe';

import { Failure } from '@/core/error/failure';
import extractErrorRepository from '@/core/utils/extract-error-repository.ts';
import {
  ProjectCreateSchema,
  ProjectMemberAddOrRemove,
  ProjectUpdateSchema,
} from '@/core/validation/project';
import { ProjectDataSource } from '@/features/Project/data/datasource/project-datasource.ts';
import { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';

import Project from '../../domain/entity/project';
import InviteVerificationModel from '../model/invite-verification-model';

@injectable()
class ProjectRepositoryImpl implements ProjectRepository {
  constructor(
    @inject('ProjectDataSource')
    private readonly projectDataSource: ProjectDataSource
  ) {}

  async createProject(
    projectData: ProjectCreateSchema
  ): Promise<Either<Failure, Project>> {
    try {
      const response = await this.projectDataSource.createProject(projectData);
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl createProject'
      );
    }
  }

  async getUserProjects(): Promise<Either<Failure, Project[]>> {
    try {
      const response = await this.projectDataSource.getUserProjects();
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl getUserProjects'
      );
    }
  }

  async getProjectById(projectId: number): Promise<Either<Failure, Project>> {
    try {
      const response = await this.projectDataSource.getProjectById(projectId);
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl getProjectById'
      );
    }
  }

  async updateProject(
    projectData: ProjectUpdateSchema
  ): Promise<Either<Failure, Project>> {
    try {
      const response = await this.projectDataSource.updateProject(projectData);
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl updateProject'
      );
    }
  }

  async deleteProject(projectId: number): Promise<Either<Failure, void>> {
    try {
      const response = await this.projectDataSource.deleteProject(projectId);
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl deleteProject'
      );
    }
  }

  async inviteMemberToProject(
    data: ProjectMemberAddOrRemove
  ): Promise<Either<Failure, void>> {
    try {
      const response = await this.projectDataSource.inviteMemberToProject(data);
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl inviteMemberToProject'
      );
    }
  }

  async removeMemberFromProject(
    data: ProjectMemberAddOrRemove
  ): Promise<Either<Failure, void>> {
    try {
      const response =
        await this.projectDataSource.removeMemberFromProject(data);
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl removeMemberFromProject'
      );
    }
  }

  async acceptInviteToProject(token: string): Promise<Either<Failure, void>> {
    try {
      const response =
        await this.projectDataSource.acceptInviteToProject(token);
      return right(response);
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl acceptInviteToProject'
      );
    }
  }

  async verifyInviteToken(
    token: string
  ): Promise<Either<Failure, InviteVerificationModel>> {
    try {
      const response = await this.projectDataSource.verifyInviteToken(token);
      return right(InviteVerificationModel.fromJSON(response));
    } catch (error) {
      return extractErrorRepository(
        error,
        'ProjectRepositoryImpl verifyInviteToken'
      );
    }
  }
}

export default ProjectRepositoryImpl;
