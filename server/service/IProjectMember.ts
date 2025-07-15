import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { Role } from '@prisma';

export interface IProjectMember {
  addProjectMember(
    projectId: number,
    memberEmail: string,
    role?: Role
  ): Promise<GeneralResponseDTO<string>>;
  updateProjectMember(
    projectId: number,
    role: Role
  ): Promise<GeneralResponseDTO<string>>;
  removeProjectMember(
    projectId: number,
    memberEmail: string
  ): Promise<GeneralResponseDTO<string>>;
}
