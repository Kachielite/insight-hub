import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import ProjectDTO from '@dto/ProjectDTO';
import { IProjectService } from '@service/IProjectService';

class ProjectService implements IProjectService {
  createProject(
    projectName: string,
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    console.log(projectName, userId);
    return Promise.resolve(undefined);
  }

  deleteProject(projectId: number): Promise<GeneralResponseDTO<string>> {
    console.log(projectId);
    return Promise.resolve(undefined);
  }

  findProjectById(projectId: number): Promise<GeneralResponseDTO<ProjectDTO>> {
    console.log(projectId);
    return Promise.resolve(undefined);
  }

  findProjectsByUserId(
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO[]>> {
    console.log(userId);
    return Promise.resolve(undefined);
  }

  updateProject(
    projectId: number,
    projectName: string
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    console.log(projectId, projectName);
    return Promise.resolve(undefined);
  }
}

export default ProjectService;
