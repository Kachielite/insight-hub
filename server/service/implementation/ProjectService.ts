import { inject, injectable } from 'tsyringe';

import { BadRequestException, InternalServerException } from '@/exception';

import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import ProjectDTO from '@dto/ProjectDTO';
import ProjectMemberDTO from '@dto/ProjectMemberDTO';
import { Project, Role, User } from '@prisma';
import ProjectMemberRepository from '@repository/implementation/ProjectMemberRepository';
import ProjectRepository from '@repository/implementation/ProjectRepository';
import UserRepository from '@repository/implementation/UserRepository';
import { IProjectService } from '@service/IProjectService';
import logger from '@utils/logger';

@injectable()
class ProjectService implements IProjectService {
  constructor(
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
    @inject(ProjectMemberRepository)
    private readonly projectMemberRepository: ProjectMemberRepository,
    @inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  public async createProject(
    projectName: string,
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    try {
      logger.info(`Creating project ${projectName} for user ${userId}`);

      // check user exist
      const user = await this.checkUserExists(userId);

      // create a project
      const newProject = await this.projectRepository.createProject(
        projectName,
        userId
      );

      // add user as admin
      await this.projectMemberRepository.addProjectMember(
        newProject.id,
        user.email,
        Role.ADMIN
      );

      // create DTO
      const projectDTO = await this.mapProjectToDTO(newProject, false);

      return new GeneralResponseDTO(
        200,
        `Project ${projectName} created`,
        projectDTO
      );
    } catch (error) {
      logger.error(`Error creating project ${projectName}: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      return new InternalServerException(
        `There was an error creating the project. Please try again later`
      );
    }
  }

  public async deleteProject(
    userId: number,
    projectId: number
  ): Promise<GeneralResponseDTO<null>> {
    try {
      logger.info(`Deleting project ${projectId}`);

      // check if a project exists
      await this.checkProjectExists(projectId);

      // check if the user is admin
      const role = await this.checkUserRole(userId, projectId);

      if (role !== Role.ADMIN) {
        logger.error(
          `User with id ${userId} is not an admin of project with id ${projectId}`
        );
        throw new BadRequestException(
          `You do not have permission to perform this action. Only project owners can perform this action`
        );
      }

      // delete repo
      await this.projectRepository.deleteProject(projectId);

      return new GeneralResponseDTO(200, `Project ${projectId} deleted`);
    } catch (error) {
      logger.error(`Error deleting project ${projectId}: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      return new InternalServerException(
        `There was an error deleting the project. Please try again later`
      );
    }
  }

  public async findProjectById(
    userId: number,
    projectId: number
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    try {
      logger.info(`Finding project with id ${projectId}`);

      // check if the user is a member of the project
      await this.checkUserRole(userId, projectId);

      // check if a project exists
      const project = await this.checkProjectExists(projectId);

      return new GeneralResponseDTO(
        200,
        `Project ${projectId} found`,
        await this.mapProjectToDTO(project, true)
      );
    } catch (error) {
      logger.error(`Error finding project with id ${projectId}: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      return new InternalServerException(
        `There was an error finding the project. Please try again later`
      );
    }
  }

  public async findProjectsByUserId(
    userId: number
  ): Promise<GeneralResponseDTO<ProjectDTO[]>> {
    try {
      logger.info(`Finding projects for user ${userId}`);

      // Fetch projects belonging to the userID
      const projects =
        await this.projectRepository.findProjectsByUserId(userId);

      const projectsDTO = projects.map(async (project) => {
        return await this.mapProjectToDTO(project, true);
      });

      return new GeneralResponseDTO(
        200,
        `Projects found`,
        await Promise.all(projectsDTO)
      );
    } catch (error) {
      logger.error(`Error finding projects for user ${userId}: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      return new InternalServerException(
        `There was an error finding the projects. Please try again later`
      );
    }
  }

  public async updateProject(
    userId: number,
    projectId: number,
    projectName: string
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    try {
      logger.info(`Updating project ${projectId}`);

      // Fetch project with projectID
      const project = await this.checkProjectExists(projectId);

      // check user role
      const role = await this.checkUserRole(userId, projectId);

      if (role !== Role.ADMIN) {
        logger.error(
          `User with id ${userId} is not an admin of project with id ${projectId}`
        );
        throw new BadRequestException(
          `You do not have permission to perform this action. Only project owners can perform this action`
        );
      }

      // update the project name
      await this.projectRepository.updateProject(projectId, projectName);

      return new GeneralResponseDTO(
        200,
        `Project ${projectId} updated`,
        await this.mapProjectToDTO(project, true)
      );
    } catch (error) {
      logger.error(`Error updating project ${projectId}: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      return new InternalServerException(
        `There was an error updating the project. Please try again later`
      );
    }
  }

  private async mapProjectToDTO(
    project: Project,
    includeMembers: boolean
  ): Promise<ProjectDTO> {
    if (includeMembers) {
      // Fetch project members
      const members = await this.projectMemberRepository.findProjectMembers(
        project.id
      );

      // Fetch user details for each member
      const memberDTOs = await Promise.all(
        members.map(async (member) => {
          const user = await this.userRepository.findUserById(member.userId);
          return new ProjectMemberDTO(
            project.id,
            user?.email ?? '',
            user?.name ?? '',
            member.role
          );
        })
      );

      return new ProjectDTO(
        project.id,
        project.name,
        project.createdAt.toLocaleDateString(),
        memberDTOs
      );
    }

    return new ProjectDTO(
      project.id,
      project.name,
      project.createdAt.toLocaleDateString()
    );
  }

  private async checkProjectExists(projectId: number): Promise<Project> {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      logger.error(`Project with id ${projectId} does not exist`);
      throw new BadRequestException(
        `Project with id ${projectId} does not exist`
      );
    }
    return project;
  }

  private async checkUserRole(
    userId: number,
    projectId: number
  ): Promise<Role> {
    const projectMember =
      await this.projectMemberRepository.findProjectMemberById(
        userId,
        projectId
      );
    if (!projectMember) {
      logger.error(
        `User with id ${userId} is not a member of project with id ${projectId}`
      );
      throw new BadRequestException(
        `This user is not a member of this project`
      );
    }
    return projectMember.role;
  }

  private async checkUserExists(userId: number): Promise<User> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      logger.error(`User with id ${userId} does not exist`);
      throw new BadRequestException('User does not exist');
    }
    return user;
  }
}

export default ProjectService;
