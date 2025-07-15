import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import ProjectDTO from '@dto/ProjectDTO';

export interface IProjectService {
  createProject(
    projectName: string,
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO>>;
  findProjectById(projectId: number): Promise<GeneralResponseDTO<ProjectDTO>>;
  findProjectsByUserId(
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO[]>>;
  updateProject(
    projectId: number,
    projectName: string
  ): Promise<GeneralResponseDTO<ProjectDTO>>;
  deleteProject(projectId: number): Promise<GeneralResponseDTO<string>>;
}
