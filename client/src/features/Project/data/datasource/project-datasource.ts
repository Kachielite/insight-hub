import { inject, injectable } from 'tsyringe';

import extractErrorDatasource from '@/core/utils/extract-error-datasource.ts';
import {
  ProjectCreateSchema,
  ProjectMemberAddOrRemove,
  ProjectUpdateSchema,
} from '@/core/validation/project.ts';
import ProjectEndpoints from '@/features/Project/data/datasource/network/project.ts';
import InviteVerificationModel from '@/features/Project/data/model/invite-verification-model.ts';
import ProjectModel from '@/features/Project/data/model/project-model.ts';
import Project from '@/features/Project/domain/entity/project.ts';

export interface ProjectDataSource {
  createProject(projectData: ProjectCreateSchema): Promise<Project>;
  getUserProjects(): Promise<Project[]>;
  getProjectById(projectId: number): Promise<Project>;
  updateProject(projectData: ProjectUpdateSchema): Promise<Project>;
  deleteProject(projectId: number): Promise<void>;
  inviteMemberToProject(data: ProjectMemberAddOrRemove): Promise<void>;
  removeMemberFromProject(data: ProjectMemberAddOrRemove): Promise<void>;
  acceptInviteToProject(token: string): Promise<void>;
  verifyInviteToken(token: string): Promise<InviteVerificationModel>;
}

@injectable()
class ProjectDataSourceImpl implements ProjectDataSource {
  private readonly projectEndpoints: ProjectEndpoints;

  constructor(@inject(ProjectEndpoints) projectEndpoints: ProjectEndpoints) {
    this.projectEndpoints = projectEndpoints;
  }

  async createProject(projectData: ProjectCreateSchema): Promise<Project> {
    try {
      const projectModel =
        await this.projectEndpoints.createProject(projectData);
      return ProjectModel.fromJson(projectModel);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl createProject'
      );
    }
  }

  async getUserProjects(): Promise<Project[]> {
    try {
      const projects = await this.projectEndpoints.getUserProjects();
      return projects.map((project) => ProjectModel.fromJson(project));
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl getUserProjects'
      );
    }
  }

  async getProjectById(projectId: number): Promise<Project> {
    try {
      const project = await this.projectEndpoints.getProjectById(projectId);
      return ProjectModel.fromJson(project);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl getProjectById'
      );
    }
  }

  async updateProject(projectData: ProjectUpdateSchema): Promise<ProjectModel> {
    try {
      const updatedProject =
        await this.projectEndpoints.updateProject(projectData);
      return ProjectModel.fromJson(updatedProject);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl updateProject'
      );
    }
  }

  async deleteProject(projectId: number): Promise<void> {
    try {
      return this.projectEndpoints.deleteProject(projectId);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl deleteProject'
      );
    }
  }

  async inviteMemberToProject(data: ProjectMemberAddOrRemove): Promise<void> {
    try {
      return this.projectEndpoints.inviteMemberToProject(data);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl inviteMemberToProject'
      );
    }
  }

  async removeMemberFromProject(data: ProjectMemberAddOrRemove): Promise<void> {
    try {
      return this.projectEndpoints.removeMemberFromProject(data);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl removeMemberFromProject'
      );
    }
  }

  async acceptInviteToProject(token: string): Promise<void> {
    try {
      return this.projectEndpoints.acceptInviteToProject(token);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl acceptInviteToProject'
      );
    }
  }

  async verifyInviteToken(token: string): Promise<InviteVerificationModel> {
    try {
      return this.projectEndpoints.verifyInviteToProject(token);
    } catch (error) {
      throw extractErrorDatasource(
        error,
        'ProjectDataSourceImpl verifyInviteToken'
      );
    }
  }
}

export default ProjectDataSourceImpl;
