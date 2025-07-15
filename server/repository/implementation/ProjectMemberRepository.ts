import prisma from '@config/db';
import { Role } from '@prisma';
import { IProjectMemberRepository } from '@repository/IProjectMemberRepository';

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
    role: Role
  ): Promise<void> {
    await prisma.projectMember.updateMany({
      where: {
        projectId,
      },
      data: {
        role,
      },
    });
  }
}

export default ProjectMemberRepository;
