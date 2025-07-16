import { container } from 'tsyringe';

import {
  BadRequestException,
  InternalServerException,
  ResourceNotFoundException,
} from '@/exception';

import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { InviteStatus, Role, TokenType } from '@prisma';
import ProjectMemberRepository from '@repository/implementation/ProjectMemberRepository';
import ProjectRepository from '@repository/implementation/ProjectRepository';
import TokenRepository from '@repository/implementation/TokenRepository';
import UserRepository from '@repository/implementation/UserRepository';
import EmailService from '@service/implementation/EmailService';
import ProjectMemberService from '@service/implementation/ProjectMemberService';
import TokenGenerator from '@utils/TokenGenerator';

// Mock dependencies with complete interfaces
const mockProjectMemberRepository = {
  addProjectMember: jest.fn(),
  removeProjectMember: jest.fn(),
  updateProjectMember: jest.fn(),
  updateProjectMemberStatus: jest.fn(), // Add the new method
  findProjectMemberById: jest.fn(),
  findProjectMembers: jest.fn(),
};

const mockProjectRepository = {
  findProjectById: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  findProjectsByUserId: jest.fn(),
};

const mockUserRepository = {
  findUserById: jest.fn(),
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

const mockTokenRepository = {
  createToken: jest.fn(),
  findTokenByToken: jest.fn(),
  findTokenByEmailAndProjectId: jest.fn(),
  findTokenByUserIdAndProjectId: jest.fn(), // Add this missing method
  deleteToken: jest.fn(),
  deleteExpiredTokens: jest.fn(),
};

const mockEmailService = {
  sendEmailProjectInvite: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

// Mock TokenGenerator
jest.mock('@utils/TokenGenerator', () => ({
  generateToken: jest.fn(() => 'mock-token'),
}));

describe('ProjectMemberService', () => {
  let projectMemberService: ProjectMemberService;

  beforeAll(() => {
    const testContainer = container.createChildContainer();

    // Register mocks using registerInstance with type assertion to bypass strict typing
    testContainer.registerInstance(
      ProjectMemberRepository,
      mockProjectMemberRepository as any
    );
    testContainer.registerInstance(
      ProjectRepository,
      mockProjectRepository as any
    );
    testContainer.registerInstance(UserRepository, mockUserRepository as any);
    testContainer.registerInstance(TokenRepository, mockTokenRepository as any);
    testContainer.registerInstance(EmailService, mockEmailService as any);

    projectMemberService = testContainer.resolve(ProjectMemberService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProjectMember', () => {
    it('should send an invitation email and add member to project if user does not exist', async () => {
      const userId = 1;
      const projectId = 1;
      const memberEmail = 'test@example.com';
      const project = {
        id: projectId,
        name: 'Test Project',
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const owner = {
        id: userId,
        name: 'Owner',
        email: 'owner@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = 'fake-token';

      mockProjectRepository.findProjectById.mockResolvedValue(project);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue({
        id: 1,
        projectId: projectId,
        userId: userId,
        role: Role.ADMIN,
        status: InviteStatus.ACCEPTED,
      });
      mockUserRepository.findUserById.mockResolvedValue(owner);
      mockUserRepository.findUserByEmail.mockResolvedValue(null);
      mockTokenRepository.findTokenByEmailAndProjectId.mockResolvedValue(null);
      (TokenGenerator.generateToken as jest.Mock).mockReturnValue(token);
      mockTokenRepository.createToken.mockResolvedValue(undefined);
      mockProjectMemberRepository.addProjectMember.mockResolvedValue(undefined);
      mockEmailService.sendEmailProjectInvite.mockResolvedValue(undefined);

      const response = await projectMemberService.addProjectMember(
        userId,
        projectId,
        memberEmail
      );

      expect(response).toEqual(
        new GeneralResponseDTO(200, `Invitation sent to ${memberEmail}`)
      );
      expect(mockProjectMemberRepository.addProjectMember).toHaveBeenCalledWith(
        projectId,
        memberEmail
      );
      expect(mockEmailService.sendEmailProjectInvite).toHaveBeenCalledWith(
        memberEmail,
        owner.name,
        project.name,
        expect.stringContaining(token)
      );
    });

    it('should throw an error if the project does not exist', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(null);

      await expect(
        projectMemberService.addProjectMember(1, 1, 'test@example.com')
      ).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw an error if user is not project member', async () => {
      const project = {
        id: 1,
        name: 'Test Project',
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProjectRepository.findProjectById.mockResolvedValue(project);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(null);

      await expect(
        projectMemberService.addProjectMember(2, 1, 'test@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete existing token and send new invitation if user already has a pending invitation', async () => {
      const userId = 1;
      const projectId = 1;
      const memberEmail = 'test@example.com';
      const project = {
        id: projectId,
        name: 'Test Project',
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const owner = {
        id: userId,
        name: 'Owner',
        email: 'owner@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const existingToken = {
        id: 1,
        projectId: projectId,
        userId: null,
        createdAt: new Date(),
        email: memberEmail,
        value: 'existing-token',
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };
      const newToken = 'new-token';

      mockProjectRepository.findProjectById.mockResolvedValue(project);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue({
        id: 1,
        projectId: projectId,
        userId: userId,
        role: Role.ADMIN,
        status: InviteStatus.ACCEPTED,
      });
      mockUserRepository.findUserById.mockResolvedValue(owner);
      mockUserRepository.findUserByEmail.mockResolvedValue(null);
      mockTokenRepository.findTokenByEmailAndProjectId.mockResolvedValue(
        existingToken
      );
      mockTokenRepository.deleteToken.mockResolvedValue(undefined);
      (TokenGenerator.generateToken as jest.Mock).mockReturnValue(newToken);
      mockTokenRepository.createToken.mockResolvedValue(undefined);
      mockProjectMemberRepository.addProjectMember.mockResolvedValue(undefined);
      mockEmailService.sendEmailProjectInvite.mockResolvedValue(undefined);

      const response = await projectMemberService.addProjectMember(
        userId,
        projectId,
        memberEmail
      );

      expect(response).toEqual(
        new GeneralResponseDTO(200, `Invitation sent to ${memberEmail}`)
      );
      expect(mockTokenRepository.deleteToken).toHaveBeenCalledWith(
        existingToken.id
      );
      expect(mockTokenRepository.createToken).toHaveBeenCalledWith(
        newToken,
        TokenType.INVITE,
        expect.any(Date),
        projectId,
        undefined,
        memberEmail
      );
      expect(mockEmailService.sendEmailProjectInvite).toHaveBeenCalledWith(
        memberEmail,
        owner.name,
        project.name,
        newToken
      );
    });
  });

  describe('acceptInvitation', () => {
    it('should accept the invitation successfully', async () => {
      const token = 'valid-token';
      const userId = 2;
      const projectId = 1;
      const project = {
        id: projectId,
        name: 'Test Project',
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const tokenDetails = {
        id: 1,
        projectId: projectId,
        userId: userId, // Token was issued for user 2
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };

      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);
      mockProjectRepository.findProjectById.mockResolvedValue(project);

      // User 2 exists as a pending member in project 1
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue({
        id: 1,
        projectId: projectId,
        userId: userId,
        role: Role.MEMBER,
        status: InviteStatus.PENDING,
      });

      mockProjectMemberRepository.updateProjectMemberStatus.mockResolvedValue(
        undefined
      );
      mockTokenRepository.deleteToken.mockResolvedValue(undefined);

      const response = await projectMemberService.acceptInvitation(
        token,
        userId
      );

      expect(response).toEqual(
        new GeneralResponseDTO(200, 'Invitation accepted')
      );
      // Verify the new method is called with the correct parameters
      expect(
        mockProjectMemberRepository.updateProjectMemberStatus
      ).toHaveBeenCalledWith(userId, projectId, InviteStatus.ACCEPTED);
      expect(mockTokenRepository.deleteToken).toHaveBeenCalledWith(
        tokenDetails.id
      );
    });

    it("should throw an error if user tries to accept someone else's invitation", async () => {
      const token = 'valid-token';
      const userId = 2;
      const tokenDetails = {
        id: 1,
        projectId: 1,
        userId: 3, // Token was issued for user 3, but user 2 is trying to accept
        createdAt: new Date(),
        email: 'other@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };

      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);

      await expect(
        projectMemberService.acceptInvitation(token, userId)
      ).rejects.toThrow(BadRequestException);

      // Should not proceed to update any status
      expect(
        mockProjectMemberRepository.updateProjectMemberStatus
      ).not.toHaveBeenCalled();
    });

    it('should throw an error for invalid or expired token', async () => {
      mockTokenRepository.findTokenByToken.mockResolvedValue(null);

      await expect(
        projectMemberService.acceptInvitation('invalid-token', 1)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error for expired token', async () => {
      const expiredToken = {
        id: 1,
        projectId: 1,
        userId: 1,
        createdAt: new Date(),
        email: 'test@example.com',
        value: 'expired-token',
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      };

      mockTokenRepository.findTokenByToken.mockResolvedValue(expiredToken);

      await expect(
        projectMemberService.acceptInvitation('expired-token', 1)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if user is not a member of the project', async () => {
      const token = 'valid-token';
      const userId = 2;
      const projectId = 1;
      const project = {
        id: projectId,
        name: 'Test Project',
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const tokenDetails = {
        id: 1,
        projectId: projectId,
        userId: userId,
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };

      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);
      mockProjectRepository.findProjectById.mockResolvedValue(project);
      // User is not found as a member
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(null);

      await expect(
        projectMemberService.acceptInvitation(token, userId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if user has already accepted the invitation', async () => {
      const token = 'valid-token';
      const userId = 2;
      const projectId = 1;
      const project = {
        id: projectId,
        name: 'Test Project',
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const tokenDetails = {
        id: 1,
        projectId: projectId,
        userId: userId,
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };

      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);
      mockProjectRepository.findProjectById.mockResolvedValue(project);
      // User already has accepted status
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue({
        id: 1,
        projectId: projectId,
        userId: userId,
        role: Role.MEMBER,
        status: InviteStatus.ACCEPTED,
      });

      await expect(
        projectMemberService.acceptInvitation(token, userId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeProjectMember', () => {
    it('should remove project member successfully', async () => {
      const userId = 1;
      const projectId = 1;
      const memberEmail = 'member@example.com';
      const project = {
        id: projectId,
        name: 'Test Project',
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const owner = {
        id: userId,
        name: 'Owner',
        email: 'owner@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProjectRepository.findProjectById.mockResolvedValue(project);
      mockUserRepository.findUserById.mockResolvedValue(owner);

      // Mock findProjectMemberById to handle multiple calls:
      // First call: Check if user (userId: 1) is admin of project (should return admin member)
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue({
        id: 1,
        projectId: projectId,
        userId: userId,
        role: Role.ADMIN,
        status: InviteStatus.ACCEPTED,
      });

      mockProjectMemberRepository.removeProjectMember.mockResolvedValue(
        undefined
      );

      const response = await projectMemberService.removeProjectMember(
        userId,
        projectId,
        memberEmail
      );

      // Fix the expected message to match the actual service response
      expect(response).toEqual(
        new GeneralResponseDTO(
          200,
          `Member ${memberEmail} removed from project ${project.name}`
        )
      );
      expect(
        mockProjectMemberRepository.removeProjectMember
      ).toHaveBeenCalledWith(projectId, memberEmail);
    });

    it('should throw an error if project does not exist', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(null);

      await expect(
        projectMemberService.removeProjectMember(1, 1, 'member@example.com')
      ).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('verifyInvitationToken', () => {
    it('should return 200 if token is valid and not expired', async () => {
      const token = 'valid-token';
      const tokenDetails = {
        id: 1,
        projectId: 1,
        userId: 2,
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day in future
      };
      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);

      const response = await projectMemberService.verifyInvitationToken(token);
      expect(response.code).toBe(200);
      expect(response.message).toBe('Token is valid');
    });

    it('should throw BadRequestException if token is not found', async () => {
      mockTokenRepository.findTokenByToken.mockResolvedValue(null);
      await expect(
        projectMemberService.verifyInvitationToken('bad-token')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is expired', async () => {
      const token = 'expired-token';
      const tokenDetails = {
        id: 1,
        projectId: 1,
        userId: 2,
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() - 1000), // expired
      };
      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);
      await expect(
        projectMemberService.verifyInvitationToken(token)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token type is not INVITE', async () => {
      const token = 'wrong-type-token';
      const tokenDetails = {
        id: 1,
        projectId: 1,
        userId: 2,
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: 'RESET', // not INVITE
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };
      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);
      await expect(
        projectMemberService.verifyInvitationToken(token)
      ).rejects.toThrow(BadRequestException);
    });

    it('should return InternalServerException for unexpected errors', async () => {
      mockTokenRepository.findTokenByToken.mockRejectedValue(
        new Error('db error')
      );
      const result =
        await projectMemberService.verifyInvitationToken('any-token');
      expect(result).toBeInstanceOf(InternalServerException);
    });

    it('should return 200 and correct verificationDTO for userId token', async () => {
      const token = 'valid-token';
      const tokenDetails = {
        id: 1,
        projectId: 1,
        userId: 2, // userId present
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };
      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);

      const response = await projectMemberService.verifyInvitationToken(token);
      expect(response.code).toBe(200);
      expect(response.message).toBe('Token is valid');
      expect(response.data).toEqual({ isVerified: true, isUser: true });
    });

    it('should return 200 and correct verificationDTO for email token', async () => {
      const token = 'valid-token';
      const tokenDetails = {
        id: 1,
        projectId: 1,
        userId: undefined, // userId not present
        createdAt: new Date(),
        email: 'test@example.com',
        value: token,
        type: TokenType.INVITE,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };
      mockTokenRepository.findTokenByToken.mockResolvedValue(tokenDetails);

      const response = await projectMemberService.verifyInvitationToken(token);
      expect(response.code).toBe(200);
      expect(response.message).toBe('Token is valid');
      expect(response.data).toEqual({ isVerified: true, isUser: false });
    });
  });
});
