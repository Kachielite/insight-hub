import { injectable } from 'tsyringe';

import prisma from '@config/db';
import { InviteStatus, ProjectMember, Role } from '@prisma';
import { IProjectMemberRepository } from '@repository/IProjectMemberRepository';

@injectable()
class ProjectMemberRepository implements IProjectMemberRepository {
  public async addProjectMember(
    projectId: number,
    memberEmail: string,
    role?: Role
  ): Promise<void> {
    await prisma.projectMember.create({
      data: {
        project: {
          connect: {
            id: projectId,
          },
        },
        user: {
          connect: {
            email: memberEmail,
          },
        },
        role: role ?? Role.MEMBER,
        status: InviteStatus.PENDING,
      },
    });
  }

  public async removeProjectMember(
    projectId: number,
    memberEmail: string
  ): Promise<void> {
    await prisma.projectMember.deleteMany({
      where: {
        projectId,
        user: {
          email: memberEmail,
        },
      },
    });
  }

  public async updateProjectMember(
    projectId: number,
    status: InviteStatus
  ): Promise<void> {
    await prisma.projectMember.updateMany({
      where: {
        projectId,
      },
      data: {
        status,
      },
    });
  }

  public async updateProjectMemberStatus(
    userId: number,
    projectId: number,
    status: InviteStatus
  ): Promise<void> {
    await prisma.projectMember.updateMany({
      where: {
        userId,
        projectId,
      },
      data: {
        status,
      },
    });
  }

  public async findProjectMemberById(
    projectId: number,
    userId: number
  ): Promise<ProjectMember | null> {
    return prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });
  }

  public async findProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return prisma.projectMember.findMany({
      where: {
        projectId,
      },
    });
  }
}

export default ProjectMemberRepository;
