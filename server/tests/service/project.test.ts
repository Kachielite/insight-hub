import { container } from 'tsyringe';

import { BadRequestException, InternalServerException } from '@/exception';

import ProjectDTO from '@dto/ProjectDTO';
import { ProjectMemberDTO } from '@dto/ProjectMemberDTO';
import { Role } from '@prisma';
import ProjectMemberRepository from '@repository/implementation/ProjectMemberRepository';
import ProjectRepository from '@repository/implementation/ProjectRepository';
import UserRepository from '@repository/implementation/UserRepository';
import ProjectService from '@service/implementation/ProjectService';

// Mock dependencies
const mockProjectRepository = {
  createProject: jest.fn(),
  deleteProject: jest.fn(),
  findProjectById: jest.fn(),
  findProjectsByUserId: jest.fn(),
  updateProject: jest.fn(),
};

const mockProjectMemberRepository = {
  addProjectMember: jest.fn(),
  findProjectMembers: jest.fn(),
  findProjectMemberById: jest.fn(),
};

const mockUserRepository = {
  findUserById: jest.fn(),
};

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeAll(() => {
    const testContainer = container.createChildContainer();

    // Register mocks
    testContainer.registerInstance(
      ProjectRepository,
      mockProjectRepository as any
    );
    testContainer.registerInstance(
      ProjectMemberRepository,
      mockProjectMemberRepository as any
    );
    testContainer.registerInstance(UserRepository, mockUserRepository as any);

    projectService = testContainer.resolve(ProjectService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    const projectName = 'Test Project';
    const userId = 1;
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.MEMBER,
      password: 'hashed-password',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    };
    const mockProject = {
      id: 1,
      name: projectName,
      createdBy: userId,
      createdAt: new Date('2024-01-01'),
    };

    it('should create project successfully', async () => {
      mockUserRepository.findUserById.mockResolvedValue(mockUser);
      mockProjectRepository.createProject.mockResolvedValue(mockProject);
      mockProjectMemberRepository.addProjectMember.mockResolvedValue(undefined);

      const result = await projectService.createProject(projectName, userId);

      expect(result.code).toBe(200);
      expect(result.message).toBe(`Project ${projectName} created`);
      expect(result.data).toEqual(
        new ProjectDTO(
          mockProject.id,
          mockProject.name,
          mockProject.createdAt.toLocaleDateString()
        )
      );
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockProjectRepository.createProject).toHaveBeenCalledWith(
        projectName,
        userId
      );
      expect(mockProjectMemberRepository.addProjectMember).toHaveBeenCalledWith(
        mockProject.id,
        mockUser.email,
        Role.ADMIN
      );
    });

    it('should throw BadRequestException when user does not exist', async () => {
      mockUserRepository.findUserById.mockResolvedValue(null);

      await expect(
        projectService.createProject(projectName, userId)
      ).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should return InternalServerException for unexpected errors', async () => {
      mockUserRepository.findUserById.mockRejectedValue(
        new Error('Database error')
      );

      const result = await projectService.createProject(projectName, userId);

      expect(result).toBeInstanceOf(InternalServerException);
    });
  });

  describe('deleteProject', () => {
    const userId = 1;
    const projectId = 1;
    const mockProject = {
      id: projectId,
      name: 'Test Project',
      createdBy: userId,
      createdAt: new Date('2024-01-01'),
    };
    const mockProjectMember = {
      id: 1,
      projectId,
      userId,
      role: Role.ADMIN,
      status: 'ACCEPTED',
      joinedAt: new Date('2024-01-01'),
    };

    it('should delete project successfully when user is admin', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(mockProject);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(
        mockProjectMember
      );
      mockProjectRepository.deleteProject.mockResolvedValue(undefined);

      const result = await projectService.deleteProject(userId, projectId);

      expect(result.code).toBe(200);
      expect(result.message).toBe(`Project ${projectId} deleted`);
      expect(mockProjectRepository.findProjectById).toHaveBeenCalledWith(
        projectId
      );
      expect(
        mockProjectMemberRepository.findProjectMemberById
      ).toHaveBeenCalledWith(userId, projectId);
      expect(mockProjectRepository.deleteProject).toHaveBeenCalledWith(
        projectId
      );
    });

    it('should throw BadRequestException when project does not exist', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(null);

      await expect(
        projectService.deleteProject(userId, projectId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not admin', async () => {
      const memberProjectMember = { ...mockProjectMember, role: Role.MEMBER };
      mockProjectRepository.findProjectById.mockResolvedValue(mockProject);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(
        memberProjectMember
      );

      await expect(
        projectService.deleteProject(userId, projectId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not a project member', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(mockProject);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(null);

      await expect(
        projectService.deleteProject(userId, projectId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should return InternalServerException for unexpected errors', async () => {
      mockProjectRepository.findProjectById.mockRejectedValue(
        new Error('Database error')
      );

      const result = await projectService.deleteProject(userId, projectId);

      expect(result).toBeInstanceOf(InternalServerException);
    });
  });

  describe('findProjectById', () => {
    const userId = 1;
    const projectId = 1;
    const mockProject = {
      id: projectId,
      name: 'Test Project',
      createdBy: userId,
      createdAt: new Date('2024-01-01'),
    };
    const mockProjectMember = {
      id: 1,
      projectId,
      userId,
      role: Role.ADMIN,
      status: 'ACCEPTED',
      joinedAt: new Date('2024-01-01'),
    };
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.MEMBER,
      password: 'hashed-password',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    };

    it('should find project by ID successfully with members', async () => {
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(
        mockProjectMember
      );
      mockProjectRepository.findProjectById.mockResolvedValue(mockProject);
      mockProjectMemberRepository.findProjectMembers.mockResolvedValue([
        mockProjectMember,
      ]);
      mockUserRepository.findUserById.mockResolvedValue(mockUser);

      const result = await projectService.findProjectById(userId, projectId);

      expect(result.code).toBe(200);
      expect(result.message).toBe(`Project ${projectId} found`);
      expect(result.data).toEqual(
        new ProjectDTO(
          mockProject.id,
          mockProject.name,
          mockProject.createdAt.toLocaleDateString(),
          [
            new ProjectMemberDTO(
              mockProject.id,
              mockUser.email,
              mockUser.name,
              mockProjectMember.role
            ),
          ]
        )
      );
    });

    it('should throw BadRequestException when user is not a project member', async () => {
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(null);

      await expect(
        projectService.findProjectById(userId, projectId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when project does not exist', async () => {
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(
        mockProjectMember
      );
      mockProjectRepository.findProjectById.mockResolvedValue(null);

      await expect(
        projectService.findProjectById(userId, projectId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should return InternalServerException for unexpected errors', async () => {
      mockProjectMemberRepository.findProjectMemberById.mockRejectedValue(
        new Error('Database error')
      );

      const result = await projectService.findProjectById(userId, projectId);

      expect(result).toBeInstanceOf(InternalServerException);
    });
  });

  describe('findProjectsByUserId', () => {
    const userId = 1;
    const mockProjects = [
      {
        id: 1,
        name: 'Project 1',
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        name: 'Project 2',
        createdBy: userId,
        createdAt: new Date('2024-01-02'),
      },
    ];
    const mockProjectMember = {
      id: 1,
      projectId: 1,
      userId,
      role: Role.ADMIN,
      status: 'ACCEPTED',
      joinedAt: new Date('2024-01-01'),
    };
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.MEMBER,
      password: 'hashed-password',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    };

    it('should find projects by user ID successfully', async () => {
      mockProjectRepository.findProjectsByUserId.mockResolvedValue(
        mockProjects
      );
      mockProjectMemberRepository.findProjectMembers.mockResolvedValue([
        mockProjectMember,
      ]);
      mockUserRepository.findUserById.mockResolvedValue(mockUser);

      const result = await projectService.findProjectsByUserId(userId);

      expect(result.code).toBe(200);
      expect(result.message).toBe('Projects found');
      expect(result.data).toHaveLength(2);
      expect(mockProjectRepository.findProjectsByUserId).toHaveBeenCalledWith(
        userId
      );
    });

    it('should return empty array when no projects found', async () => {
      mockProjectRepository.findProjectsByUserId.mockResolvedValue([]);

      const result = await projectService.findProjectsByUserId(userId);

      expect(result.code).toBe(200);
      expect(result.message).toBe('Projects found');
      expect(result.data).toEqual([]);
    });

    it('should return InternalServerException for unexpected errors', async () => {
      mockProjectRepository.findProjectsByUserId.mockRejectedValue(
        new Error('Database error')
      );

      const result = await projectService.findProjectsByUserId(userId);

      expect(result).toBeInstanceOf(InternalServerException);
    });
  });

  describe('updateProject', () => {
    const userId = 1;
    const projectId = 1;
    const newProjectName = 'Updated Project';
    const mockProject = {
      id: projectId,
      name: 'Test Project',
      createdBy: userId,
      createdAt: new Date('2024-01-01'),
    };
    const mockProjectMember = {
      id: 1,
      projectId,
      userId,
      role: Role.ADMIN,
      status: 'ACCEPTED',
      joinedAt: new Date('2024-01-01'),
    };
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.MEMBER,
      password: 'hashed-password',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    };

    it('should update project successfully when user is admin', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(mockProject);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(
        mockProjectMember
      );
      mockProjectRepository.updateProject.mockResolvedValue(undefined);
      mockProjectMemberRepository.findProjectMembers.mockResolvedValue([
        mockProjectMember,
      ]);
      mockUserRepository.findUserById.mockResolvedValue(mockUser);

      const result = await projectService.updateProject(
        userId,
        projectId,
        newProjectName
      );

      expect(result.code).toBe(200);
      expect(result.message).toBe(`Project ${projectId} updated`);
      expect(mockProjectRepository.findProjectById).toHaveBeenCalledWith(
        projectId
      );
      expect(
        mockProjectMemberRepository.findProjectMemberById
      ).toHaveBeenCalledWith(userId, projectId);
      expect(mockProjectRepository.updateProject).toHaveBeenCalledWith(
        projectId,
        newProjectName
      );
    });

    it('should throw BadRequestException when project does not exist', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(null);

      await expect(
        projectService.updateProject(userId, projectId, newProjectName)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not admin', async () => {
      const memberProjectMember = { ...mockProjectMember, role: Role.MEMBER };
      mockProjectRepository.findProjectById.mockResolvedValue(mockProject);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(
        memberProjectMember
      );

      await expect(
        projectService.updateProject(userId, projectId, newProjectName)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not a project member', async () => {
      mockProjectRepository.findProjectById.mockResolvedValue(mockProject);
      mockProjectMemberRepository.findProjectMemberById.mockResolvedValue(null);

      await expect(
        projectService.updateProject(userId, projectId, newProjectName)
      ).rejects.toThrow(BadRequestException);
    });

    it('should return InternalServerException for unexpected errors', async () => {
      mockProjectRepository.findProjectById.mockRejectedValue(
        new Error('Database error')
      );

      const result = await projectService.updateProject(
        userId,
        projectId,
        newProjectName
      );

      expect(result).toBeInstanceOf(InternalServerException);
    });
  });
});
