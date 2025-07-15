import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import ProjectDTO from '@dto/ProjectDTO';

export interface IProjectService {
  createProject(
    projectName: string,
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO>>;
  findProjectById(
    userId: number,
    projectId: number
  ): Promise<GeneralResponseDTO<ProjectDTO>>;
  findProjectsByUserId(
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO[]>>;
  updateProject(
    userId: number,
    projectId: number,
    projectName: string
  ): Promise<GeneralResponseDTO<ProjectDTO>>;
  deleteProject(
    userId: number,
    projectId: number
  ): Promise<GeneralResponseDTO<null>>;
}
