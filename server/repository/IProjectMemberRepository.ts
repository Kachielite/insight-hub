import { InviteStatus, ProjectMember, Role } from '@prisma';

export interface IProjectMemberRepository {
  addProjectMember(
    projectId: number,
    memberEmail: string,
    role?: Role
  ): Promise<void>;
  findProjectMembers(projectId: number): Promise<ProjectMember[]>;
  findProjectMemberById(
    projectId: number,
    userId: number
  ): Promise<ProjectMember | null>;
  updateProjectMember(projectId: number, status: InviteStatus): Promise<void>;
  removeProjectMember(projectId: number, memberEmail: string): Promise<void>;
}
