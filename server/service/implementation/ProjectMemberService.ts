import { inject, injectable } from 'tsyringe';

import {
  BadRequestException,
  InternalServerException,
  ResourceNotFoundException,
} from '@/exception';

import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { InviteStatus, Project, Role, TokenType, User } from '@prisma';
import ProjectMemberRepository from '@repository/implementation/ProjectMemberRepository';
import ProjectRepository from '@repository/implementation/ProjectRepository';
import TokenRepository from '@repository/implementation/TokenRepository';
import UserRepository from '@repository/implementation/UserRepository';
import EmailService from '@service/implementation/EmailService';
import { IProjectMember } from '@service/IProjectMember';
import logger from '@utils/logger';
import TokenGenerator from '@utils/TokenGenerator';

@injectable()
class ProjectMemberService implements IProjectMember {
  constructor(
    @inject(ProjectMemberRepository)
    private readonly projectMemberRepository: ProjectMemberRepository,
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(TokenRepository) private readonly tokenRepository: TokenRepository,
    @inject(EmailService) private readonly emailService: EmailService
  ) {}

  public async addProjectMember(
    userId: number,
    projectId: number,
    memberEmail: string
  ): Promise<GeneralResponseDTO<null>> {
    try {
      logger.info(`Inviting member ${memberEmail} to project ${projectId}`);

      // Check if the project exists and is owned by the user
      const { project, owner } = await this.findProjectAndProjectOwnerDetails(
        projectId,
        userId
      );

      // expiry period of 15 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);

      // Check if the user exists
      const user = await this.userRepository.findUserByEmail(memberEmail);

      if (!user) {
        // Check if the user has already been invited
        const token = await this.checkTokenExists(projectId, memberEmail);

        // Create a token
        await this.tokenRepository.createToken(
          token,
          TokenType.INVITE,
          expiryDate,
          projectId,
          undefined,
          memberEmail
        );
        // add member to project
        await this.projectMemberRepository.addProjectMember(
          projectId,
          memberEmail
        );

        // Send an email
        await this.emailService.sendEmailProjectInvite(
          memberEmail,
          owner.name,
          project.name,
          token
        );

        return new GeneralResponseDTO(200, `Invitation sent to ${memberEmail}`);
      }

      // Check if token already exists
      const token = await this.checkTokenExists(projectId, undefined, user.id);

      // Create a token
      await this.tokenRepository.createToken(
        token,
        TokenType.INVITE,
        expiryDate,
        projectId,
        user.id,
        undefined
      );
      // add member to project
      await this.projectMemberRepository.addProjectMember(
        projectId,
        memberEmail
      );

      // Send an email
      await this.emailService.sendEmailProjectInvite(
        memberEmail,
        owner.name,
        project.name,
        token
      );

      return new GeneralResponseDTO(200, `Invitation sent to ${memberEmail}`);
    } catch (error) {
      logger.error(
        `Error inviting member ${memberEmail} to project ${projectId}: ${error}`
      );
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      return new InternalServerException(
        `There was an error inviting member ${memberEmail} to this project. Please try again later`
      );
    }
  }

  public async acceptInvitation(
    token: string,
    userId: number
  ): Promise<GeneralResponseDTO<null>> {
    try {
      logger.info(`Accepting invitation from user ${userId}`);

      // Check if token exists and is valid
      const tokenDetails = await this.tokenRepository.findTokenByToken(token);

      if (
        !tokenDetails ||
        tokenDetails.type !== TokenType.INVITE ||
        tokenDetails.expiresAt < new Date()
      ) {
        logger.error(`Token ${token} is invalid or has expired`);
        throw new BadRequestException(
          'Invalid or expired token. Please ask the owner to invite you again'
        );
      }

      // Validate that the user accepting the invitation is the same user the token was issued for
      if (tokenDetails.userId !== userId) {
        logger.error(
          `User ${userId} is trying to accept a token issued for user ${tokenDetails.userId}`
        );
        throw new BadRequestException(
          'You can only accept invitations that were sent to you'
        );
      }

      // Get project details (no need to check admin permissions here)
      const project = await this.projectRepository.findProjectById(
        tokenDetails.projectId as number
      );

      if (!project) {
        logger.error(
          `Project with id: ${tokenDetails.projectId} does not exist`
        );
        throw new ResourceNotFoundException(
          `The project you are trying to access does not exist`
        );
      }

      // Check if user is already a member of the project
      const projectMember =
        await this.projectMemberRepository.findProjectMemberById(
          userId,
          project.id
        );

      if (!projectMember) {
        logger.error(
          `User ${userId} is not a member of project ${tokenDetails.projectId}`
        );
        throw new BadRequestException(
          `User with id ${userId} is not a member of project with id ${tokenDetails.projectId}`
        );
      }

      // Check invite status
      if (projectMember.status === InviteStatus.ACCEPTED) {
        logger.error(
          `User ${userId} has already accepted the invitation to project ${tokenDetails.projectId}`
        );
        throw new BadRequestException(
          `User with id ${userId} is already a member of project with id ${tokenDetails.projectId}`
        );
      }

      // Update the specific user's invite status (not all project members)
      await this.projectMemberRepository.updateProjectMemberStatus(
        userId,
        tokenDetails.projectId as number,
        InviteStatus.ACCEPTED
      );

      // Delete the token
      await this.tokenRepository.deleteToken(tokenDetails.id);

      return new GeneralResponseDTO(200, `Invitation accepted`);
    } catch (error) {
      logger.error(`Error accepting invitation from user ${userId}: ${error}`);
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      return new InternalServerException(
        `There was an error accepting the invitation. Please try again later`
      );
    }
  }

  async removeProjectMember(
    userId: number,
    projectId: number,
    memberEmail: string
  ): Promise<GeneralResponseDTO<null>> {
    try {
      logger.info(`Removing member ${memberEmail} from project ${projectId}`);

      const { project, owner } = await this.findProjectAndProjectOwnerDetails(
        projectId,
        userId
      );

      if (owner.id !== userId) {
        logger.error(`User ${userId} is not an admin of project ${projectId}`);
        throw new BadRequestException(
          `You do not have permission to perform this action. Only project owners can perform this action`
        );
      }

      await this.projectMemberRepository.removeProjectMember(
        projectId,
        memberEmail
      );

      return new GeneralResponseDTO(
        200,
        `Member ${memberEmail} removed from project ${project.name}`
      );
    } catch (error) {
      logger.error(
        `Error removing member ${memberEmail} from project ${projectId}: ${error}`
      );
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      return new InternalServerException(
        `There was an error removing member ${memberEmail} from this project. Please try again later`
      );
    }
  }

  private async findProjectAndProjectOwnerDetails(
    projectId: number,
    userId: number
  ): Promise<{ project: Project; owner: User }> {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      logger.error(`Project with id ${projectId} does not exist`);
      throw new ResourceNotFoundException(
        `The project you are trying to access does not exist`
      );
    }
    const projectOwner =
      await this.projectMemberRepository.findProjectMemberById(
        userId,
        projectId
      );

    if (!projectOwner) {
      logger.error(
        `Project owner with id ${userId} is not a member of project with id ${projectId}`
      );
      throw new BadRequestException(`You are not a member of this project`);
    }

    if (projectOwner.role !== Role.ADMIN) {
      logger.error(
        `Project owner with id ${userId} is not an admin of project with id ${projectId}`
      );
      throw new BadRequestException(
        `You do not have permission to perform this action. Only project owners can perform this action`
      );
    }

    const owner = await this.userRepository.findUserById(userId);

    if (!owner) {
      logger.error(`User with id ${userId} does not exist`);
      throw new ResourceNotFoundException(
        `The user you are trying to access does not exist`
      );
    }
    return { project, owner };
  }

  private async checkTokenExists(
    projectId: number,
    email?: string,
    userId?: number
  ): Promise<string> {
    let token;

    if (email) {
      token = await this.tokenRepository.findTokenByEmailAndProjectId(
        email,
        projectId
      );
    }

    if (userId) {
      token = await this.tokenRepository.findTokenByUserIdAndProjectId(
        userId,
        projectId
      );
    }

    if (token) {
      await this.tokenRepository.deleteToken(token.id);
    }

    return TokenGenerator.generateToken();
  }
}

export default ProjectMemberService;
