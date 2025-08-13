import { AxiosInstance } from 'axios';
import { inject, injectable } from 'tsyringe';

import extractErrorEndpoints from '@/core/utils/extract-error-endpoints.ts';
import {
  ProjectCreateSchema,
  ProjectMemberAddOrRemove,
  ProjectUpdateSchema,
} from '@/core/validation/project.ts';
import InviteVerificationModel from '@/features/Project/data/model/invite-verification-model.ts';
import ProjectModel from '@/features/Project/data/model/project-model.ts';

@injectable()
class ProjectEndpoints {
  private readonly projectPath = '/projects';

  constructor(
    @inject('axiosClient') private readonly axiosClient: AxiosInstance
  ) {}

  public async createProject(
    projectData: ProjectCreateSchema
  ): Promise<ProjectModel> {
    try {
      const response = await this.axiosClient.post(`${this.projectPath}`, {
        ...projectData,
      });
      return response.data.data;
    } catch (error) {
      console.error('ProjectEndpoints.createProject: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async getUserProjects(): Promise<ProjectModel[]> {
    try {
      const response = await this.axiosClient.get(`${this.projectPath}/user`);
      return response.data.data;
    } catch (error) {
      console.error('ProjectEndpoints.getUserProjects: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async getProjectById(projectId: number): Promise<ProjectModel> {
    try {
      const response = await this.axiosClient.get(
        `${this.projectPath}/${projectId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('ProjectEndpoints.getProjectById: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async updateProject(
    projectData: ProjectUpdateSchema
  ): Promise<ProjectModel> {
    try {
      const response = await this.axiosClient.put(
        `${this.projectPath}/${projectData.projectId}`,
        {
          projectName: projectData.projectName,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('ProjectEndpoints.updateProject: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async deleteProject(projectId: number): Promise<void> {
    try {
      await this.axiosClient.delete(`${this.projectPath}/${projectId}`);
    } catch (error) {
      console.error('ProjectEndpoints.deleteProject: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async inviteMemberToProject(
    data: ProjectMemberAddOrRemove
  ): Promise<void> {
    try {
      await this.axiosClient.post(
        `${this.projectPath}/${data.projectId}/members`,
        {
          memberEmail: data.memberEmail,
        }
      );
    } catch (error) {
      console.error('ProjectEndpoints.inviteMemberToProject: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async removeMemberFromProject(
    data: ProjectMemberAddOrRemove
  ): Promise<void> {
    try {
      await this.axiosClient.delete(
        `${this.projectPath}/${data.projectId}/members?memberEmail=${data.memberEmail}`
      );
    } catch (error) {
      console.error('ProjectEndpoints.removeMemberFromProject: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async acceptInviteToProject(token: string): Promise<void> {
    try {
      await this.axiosClient.post(`${this.projectPath}/accept`, {
        token: token,
      });
    } catch (error) {
      console.error('ProjectEndpoints.acceptInviteToProject: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }

  public async verifyInviteToProject(
    token: string
  ): Promise<InviteVerificationModel> {
    try {
      const response = await this.axiosClient.get(
        `${this.projectPath}/members/verify-invite?token=${token}`
      );
      return response.data.data;
    } catch (error) {
      console.error('ProjectEndpoints.verifyInviteToProject: ', error);
      const errorMessage = extractErrorEndpoints(error);
      throw new Error(errorMessage);
    }
  }
}

export default ProjectEndpoints;
