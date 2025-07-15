import prisma from '@config/db';
import { Project } from '@prisma';
import { IProjectRepository } from '@repository/IProjectRepository';

class ProjectRepository implements IProjectRepository {
  public async createProject(
    projectName: string,
    userId: number
  ): Promise<Project> {
    return prisma.project.create({
      data: {
        name: projectName,
        owner: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  public async deleteProject(projectId: number): Promise<Project> {
    return prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }

  public async findProjectById(projectId: number): Promise<Project | null> {
    return prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
  }

  public async findProjectsByUserId(userId: number): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        owner: {
          id: userId,
        },
      },
    });
  }

  public async updateProject(
    projectId: number,
    projectName: string
  ): Promise<Project> {
    return prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: projectName,
      },
    });
  }
}

export default ProjectRepository;
