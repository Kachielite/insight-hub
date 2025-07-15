// Mock the prisma client with properly typed Jest mocks
import { container } from 'tsyringe';

import mockPrisma from '@config/db';
import { Role } from '@prisma';
import ProjectMemberRepository from '@repository/implementation/ProjectMemberRepository';

jest.mock('@config/db', () => ({
  projectMember: {
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

// Create a properly typed mock object
const mockPrismaClient = mockPrisma as {
  projectMember: {
    create: jest.MockedFunction<any>;
    updateMany: jest.MockedFunction<any>;
    deleteMany: jest.MockedFunction<any>;
  };
};

describe('ProjectMember Repository', () => {
  let projectMemberRepository: ProjectMemberRepository;

  beforeAll(() => {
    const testContainer = container.createChildContainer();
    projectMemberRepository = testContainer.resolve(ProjectMemberRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProjectMember', () => {
    const projectId = 1;
    const memberEmail = 'test@example.com';

    it('should add a project member with default role', async () => {
      mockPrismaClient.projectMember.create.mockResolvedValue({});

      await projectMemberRepository.addProjectMember(projectId, memberEmail);

      expect(mockPrismaClient.projectMember.create).toHaveBeenCalledWith({
        data: {
          project: {
            connect: {
              id: projectId,
            },
          },
          user: {
            connect: {
              email: memberEmail,
            },
          },
          role: Role.MEMBER,
        },
      });
    });

    it('should add a project member with specified role', async () => {
      const role = Role.ADMIN;
      mockPrismaClient.projectMember.create.mockResolvedValue({});

      await projectMemberRepository.addProjectMember(
        projectId,
        memberEmail,
        role
      );

      expect(mockPrismaClient.projectMember.create).toHaveBeenCalledWith({
        data: {
          project: {
            connect: {
              id: projectId,
            },
          },
          user: {
            connect: {
              email: memberEmail,
            },
          },
          role: role,
        },
      });
    });
  });

  describe('updateProjectMember', () => {
    const projectId = 1;
    const role = Role.ADMIN;

    it('should update project member role', async () => {
      mockPrismaClient.projectMember.updateMany.mockResolvedValue({ count: 1 });

      await projectMemberRepository.updateProjectMember(projectId, role);

      expect(mockPrismaClient.projectMember.updateMany).toHaveBeenCalledWith({
        where: {
          projectId,
        },
        data: {
          role,
        },
      });
    });
  });

  describe('removeProjectMember', () => {
    const projectId = 1;
    const memberEmail = 'test@example.com';

    it('should remove a project member', async () => {
      mockPrismaClient.projectMember.deleteMany.mockResolvedValue({ count: 1 });

      await projectMemberRepository.removeProjectMember(projectId, memberEmail);

      expect(mockPrismaClient.projectMember.deleteMany).toHaveBeenCalledWith({
        where: {
          projectId,
          user: {
            email: memberEmail,
          },
        },
      });
    });
  });
});
