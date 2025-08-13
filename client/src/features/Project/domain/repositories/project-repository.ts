import { Either } from 'fp-ts/Either';

import { Failure } from '@/core/error/failure.ts';
import {
  ProjectCreateSchema,
  ProjectMemberAddOrRemove,
  ProjectUpdateSchema,
} from '@/core/validation/project.ts';
import InviteVerificationModel from '@/features/Project/data/model/invite-verification-model.ts';
import Project from '@/features/Project/domain/entity/project.ts';

export interface ProjectRepository {
  createProject(
    projectData: ProjectCreateSchema
  ): Promise<Either<Failure, Project>>;
  getUserProjects(): Promise<Either<Failure, Project[]>>;
  getProjectById(projectId: number): Promise<Either<Failure, Project>>;
  updateProject(
    projectData: ProjectUpdateSchema
  ): Promise<Either<Failure, Project>>;
  deleteProject(projectId: number): Promise<Either<Failure, void>>;
  inviteMemberToProject(
    data: ProjectMemberAddOrRemove
  ): Promise<Either<Failure, void>>;
  removeMemberFromProject(
    data: ProjectMemberAddOrRemove
  ): Promise<Either<Failure, void>>;
  acceptInviteToProject(token: string): Promise<Either<Failure, void>>;
  verifyInviteToken(
    token: string
  ): Promise<Either<Failure, InviteVerificationModel>>;
}
