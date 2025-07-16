import { Project } from '@prisma';

export interface IProjectRepository {
  createProject(projectName: string, userId: number): Promise<Project>;
  findProjectById(projectId: number): Promise<Project | null>;
  findProjectsByUserId(userId: number): Promise<Project[]>;
  updateProject(projectId: number, projectName: string): Promise<Project>;
  deleteProject(projectId: number): Promise<Project>;
}
