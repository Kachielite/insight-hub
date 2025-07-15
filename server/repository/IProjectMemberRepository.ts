import { Role } from '@prisma';

export interface IProjectMemberRepository {
  addProjectMember(
    projectId: number,
    memberEmail: string,
    role?: Role
  ): Promise<void>;
  updateProjectMember(projectId: number, role: Role): Promise<void>;
  removeProjectMember(projectId: number, memberEmail: string): Promise<void>;
}
