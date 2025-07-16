// Mock the prisma client with properly typed Jest mocks
import { container } from 'tsyringe';

import mockPrisma from '@config/db';
import ProjectRepository from '@repository/implementation/ProjectRepository';

jest.mock('@config/db', () => ({
  project: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Create a properly typed mock object
const mockPrismaClient = mockPrisma as {
  project: {
    create: jest.MockedFunction<any>;
    findUnique: jest.MockedFunction<any>;
    findMany: jest.MockedFunction<any>;
    update: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  };
};

describe('Project Repository', () => {
  let projectRepository: ProjectRepository;

  beforeAll(() => {
    const testContainer = container.createChildContainer();
    projectRepository = testContainer.resolve(ProjectRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    const projectName = 'Test Project';
    const userId = 1;

    it('should create a new project', async () => {
      mockPrismaClient.project.create.mockResolvedValue({
        id: 1,
        name: projectName,
      });

      const result = await projectRepository.createProject(projectName, userId);

      expect(result).toEqual({ id: 1, name: projectName });
      expect(mockPrismaClient.project.create).toHaveBeenCalledWith({
        data: {
          name: projectName,
          owner: {
            connect: {
              id: userId,
            },
          },
        },
      });
    });
  });

  describe('findProjectById', () => {
    const projectId = 1;
    const mockProject = { id: 1, name: 'Test Project', ownerId: 1 };

    it('should find a project by id', async () => {
      mockPrismaClient.project.findUnique.mockResolvedValue(mockProject);

      const result = await projectRepository.findProjectById(projectId);

      expect(result).toEqual(mockProject);
      expect(mockPrismaClient.project.findUnique).toHaveBeenCalledWith({
        where: {
          id: projectId,
        },
      });
    });

    it('should return null when project is not found', async () => {
      mockPrismaClient.project.findUnique.mockResolvedValue(null);

      const result = await projectRepository.findProjectById(999);

      expect(result).toBeNull();
      expect(mockPrismaClient.project.findUnique).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
    });
  });

  describe('findProjectsByUserId', () => {
    const userId = 1;
    const mockProjects = [
      { id: 1, name: 'Project 1', ownerId: 1 },
      { id: 2, name: 'Project 2', ownerId: 1 },
    ];

    it('should find all projects for a user', async () => {
      mockPrismaClient.project.findMany.mockResolvedValue(mockProjects);

      const result = await projectRepository.findProjectsByUserId(userId);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaClient.project.findMany).toHaveBeenCalledWith({
        where: {
          owner: {
            id: userId,
          },
        },
      });
    });

    it('should return empty array when user has no projects', async () => {
      mockPrismaClient.project.findMany.mockResolvedValue([]);

      const result = await projectRepository.findProjectsByUserId(999);

      expect(result).toEqual([]);
      expect(mockPrismaClient.project.findMany).toHaveBeenCalledWith({
        where: {
          owner: {
            id: 999,
          },
        },
      });
    });
  });

  describe('updateProject', () => {
    const projectId = 1;
    const newProjectName = 'Updated Project';
    const mockUpdatedProject = { id: 1, name: newProjectName, ownerId: 1 };

    it('should update a project name', async () => {
      mockPrismaClient.project.update.mockResolvedValue(mockUpdatedProject);

      const result = await projectRepository.updateProject(
        projectId,
        newProjectName
      );

      expect(result).toEqual(mockUpdatedProject);
      expect(mockPrismaClient.project.update).toHaveBeenCalledWith({
        where: {
          id: projectId,
        },
        data: {
          name: newProjectName,
        },
      });
    });
  });

  describe('deleteProject', () => {
    const projectId = 1;
    const mockDeletedProject = { id: 1, name: 'Deleted Project', ownerId: 1 };

    it('should delete a project', async () => {
      mockPrismaClient.project.delete.mockResolvedValue(mockDeletedProject);

      const result = await projectRepository.deleteProject(projectId);

      expect(result).toEqual(mockDeletedProject);
      expect(mockPrismaClient.project.delete).toHaveBeenCalledWith({
        where: {
          id: projectId,
        },
      });
    });
  });
});
