import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { Role } from '@prisma';

export interface IProjectMember {
  addProjectMember(
    userId: number,
    projectId: number,
    memberEmail: string,
    role?: Role
  ): Promise<GeneralResponseDTO<null>>;
  acceptInvitation(
    token: string,
    userId: number
  ): Promise<GeneralResponseDTO<null>>;
  removeProjectMember(
    userId: number,
    projectId: number,
    memberEmail: string
  ): Promise<GeneralResponseDTO<null>>;
  verifyInvitationToken(token: string): Promise<GeneralResponseDTO<null>>;
}
