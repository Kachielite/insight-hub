// Mock the prisma client with properly typed Jest mocks
import { container } from 'tsyringe';

import mockPrisma from '@config/db';
import { InviteStatus, Role } from '@prisma';
import ProjectMemberRepository from '@repository/implementation/ProjectMemberRepository';

jest.mock('@config/db', () => ({
  projectMember: {
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
}));

// Create a properly typed mock object
const mockPrismaClient = mockPrisma as {
  projectMember: {
    create: jest.MockedFunction<any>;
    updateMany: jest.MockedFunction<any>;
    deleteMany: jest.MockedFunction<any>;
    findFirst: jest.MockedFunction<any>;
    findMany: jest.MockedFunction<any>;
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

    it('should add a project member with default role and pending status', async () => {
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
          status: InviteStatus.PENDING,
        },
      });
    });

    it('should add a project member with specified role and pending status', async () => {
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
          status: InviteStatus.PENDING,
        },
      });
    });
  });

  describe('updateProjectMember', () => {
    const projectId = 1;

    it('should update project member status to ACCEPTED', async () => {
      mockPrismaClient.projectMember.updateMany.mockResolvedValue({ count: 1 });

      await projectMemberRepository.updateProjectMember(
        projectId,
        InviteStatus.ACCEPTED
      );

      expect(mockPrismaClient.projectMember.updateMany).toHaveBeenCalledWith({
        where: {
          projectId,
        },
        data: {
          status: InviteStatus.ACCEPTED,
        },
      });
    });

    it('should update project member status to REJECTED', async () => {
      mockPrismaClient.projectMember.updateMany.mockResolvedValue({ count: 1 });

      await projectMemberRepository.updateProjectMember(
        projectId,
        InviteStatus.REJECTED
      );

      expect(mockPrismaClient.projectMember.updateMany).toHaveBeenCalledWith({
        where: {
          projectId,
        },
        data: {
          status: InviteStatus.REJECTED,
        },
      });
    });

    it('should update project member status to PENDING', async () => {
      mockPrismaClient.projectMember.updateMany.mockResolvedValue({ count: 1 });

      await projectMemberRepository.updateProjectMember(
        projectId,
        InviteStatus.PENDING
      );

      expect(mockPrismaClient.projectMember.updateMany).toHaveBeenCalledWith({
        where: {
          projectId,
        },
        data: {
          status: InviteStatus.PENDING,
        },
      });
    });

    it('should handle database errors during status update', async () => {
      const dbError = new Error('Database update failed');
      mockPrismaClient.projectMember.updateMany.mockRejectedValue(dbError);

      await expect(
        projectMemberRepository.updateProjectMember(
          projectId,
          InviteStatus.ACCEPTED
        )
      ).rejects.toThrow('Database update failed');

      expect(mockPrismaClient.projectMember.updateMany).toHaveBeenCalledWith({
        where: {
          projectId,
        },
        data: {
          status: InviteStatus.ACCEPTED,
        },
      });
    });

    it('should handle updating non-existent project members', async () => {
      mockPrismaClient.projectMember.updateMany.mockResolvedValue({ count: 0 });

      await projectMemberRepository.updateProjectMember(
        999,
        InviteStatus.ACCEPTED
      );

      expect(mockPrismaClient.projectMember.updateMany).toHaveBeenCalledWith({
        where: {
          projectId: 999,
        },
        data: {
          status: InviteStatus.ACCEPTED,
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

  describe('findProjectMemberById', () => {
    const projectId = 1;
    const userId = 2;

    const mockProjectMember = {
      id: 1,
      projectId: 1,
      userId: 2,
      role: Role.MEMBER,
      status: InviteStatus.PENDING,
      createdAt: new Date('2025-07-15T18:00:00.000Z'),
      updatedAt: new Date('2025-07-15T18:00:00.000Z'),
    };

    it('should find project member by projectId and userId', async () => {
      mockPrismaClient.projectMember.findFirst.mockResolvedValue(
        mockProjectMember
      );

      const result = await projectMemberRepository.findProjectMemberById(
        projectId,
        userId
      );

      expect(result).toEqual(mockProjectMember);
      expect(mockPrismaClient.projectMember.findFirst).toHaveBeenCalledWith({
        where: {
          projectId: 1,
          userId: 2,
        },
      });
      expect(mockPrismaClient.projectMember.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should return null when project member is not found', async () => {
      mockPrismaClient.projectMember.findFirst.mockResolvedValue(null);

      const result = await projectMemberRepository.findProjectMemberById(
        projectId,
        999
      );

      expect(result).toBeNull();
      expect(mockPrismaClient.projectMember.findFirst).toHaveBeenCalledWith({
        where: {
          projectId: 1,
          userId: 999,
        },
      });
    });

    it('should handle database errors during search', async () => {
      const dbError = new Error('Database connection error');
      mockPrismaClient.projectMember.findFirst.mockRejectedValue(dbError);

      await expect(
        projectMemberRepository.findProjectMemberById(projectId, userId)
      ).rejects.toThrow('Database connection error');

      expect(mockPrismaClient.projectMember.findFirst).toHaveBeenCalledWith({
        where: {
          projectId: 1,
          userId: 2,
        },
      });
    });

    it('should handle edge cases with invalid project or user IDs', async () => {
      mockPrismaClient.projectMember.findFirst.mockResolvedValue(null);

      const result1 = await projectMemberRepository.findProjectMemberById(
        0,
        userId
      );
      const result2 = await projectMemberRepository.findProjectMemberById(
        projectId,
        0
      );

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(mockPrismaClient.projectMember.findFirst).toHaveBeenCalledTimes(2);
    });

    it('should handle negative IDs', async () => {
      mockPrismaClient.projectMember.findFirst.mockResolvedValue(null);

      const result = await projectMemberRepository.findProjectMemberById(
        -1,
        -1
      );

      expect(result).toBeNull();
      expect(mockPrismaClient.projectMember.findFirst).toHaveBeenCalledWith({
        where: {
          projectId: -1,
          userId: -1,
        },
      });
    });
  });

  describe('findProjectMembers', () => {
    const projectId = 1;

    const mockProjectMembers = [
      {
        id: 1,
        projectId: 1,
        userId: 1,
        role: Role.MEMBER,
        status: InviteStatus.PENDING,
        createdAt: new Date('2025-07-15T18:00:00.000Z'),
        updatedAt: new Date('2025-07-15T18:00:00.000Z'),
      },
      {
        id: 2,
        projectId: 1,
        userId: 2,
        role: Role.ADMIN,
        status: InviteStatus.ACCEPTED,
        createdAt: new Date('2025-07-15T18:00:00.000Z'),
        updatedAt: new Date('2025-07-15T18:00:00.000Z'),
      },
    ];

    it('should find all project members and return ProjectMember array', async () => {
      mockPrismaClient.projectMember.findMany.mockResolvedValue(
        mockProjectMembers
      );

      const result =
        await projectMemberRepository.findProjectMembers(projectId);

      expect(result).toEqual(mockProjectMembers);
      expect(mockPrismaClient.projectMember.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 1,
        },
      });
      expect(mockPrismaClient.projectMember.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when project has no members', async () => {
      mockPrismaClient.projectMember.findMany.mockResolvedValue([]);

      const result =
        await projectMemberRepository.findProjectMembers(projectId);

      expect(result).toEqual([]);
      expect(mockPrismaClient.projectMember.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 1,
        },
      });
    });

    it('should handle database errors during project members search', async () => {
      const dbError = new Error('Database query failed');
      mockPrismaClient.projectMember.findMany.mockRejectedValue(dbError);

      await expect(
        projectMemberRepository.findProjectMembers(projectId)
      ).rejects.toThrow('Database query failed');

      expect(mockPrismaClient.projectMember.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 1,
        },
      });
    });

    it('should handle different project IDs', async () => {
      mockPrismaClient.projectMember.findMany.mockResolvedValue([]);

      await projectMemberRepository.findProjectMembers(999);

      expect(mockPrismaClient.projectMember.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 999,
        },
      });
    });

    it('should handle zero or negative project IDs', async () => {
      mockPrismaClient.projectMember.findMany.mockResolvedValue([]);

      const result1 = await projectMemberRepository.findProjectMembers(0);
      const result2 = await projectMemberRepository.findProjectMembers(-1);

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(mockPrismaClient.projectMember.findMany).toHaveBeenCalledTimes(2);
    });

    it('should return ProjectMembers with different roles', async () => {
      const mixedRoleMembers = [
        {
          id: 1,
          projectId: 1,
          userId: 1,
          role: Role.MEMBER,
          status: InviteStatus.PENDING,
          createdAt: new Date('2025-07-15T18:00:00.000Z'),
          updatedAt: new Date('2025-07-15T18:00:00.000Z'),
        },
        {
          id: 2,
          projectId: 1,
          userId: 2,
          role: Role.ADMIN,
          status: InviteStatus.ACCEPTED,
          createdAt: new Date('2025-07-15T18:00:00.000Z'),
          updatedAt: new Date('2025-07-15T18:00:00.000Z'),
        },
      ];

      mockPrismaClient.projectMember.findMany.mockResolvedValue(
        mixedRoleMembers
      );

      const result =
        await projectMemberRepository.findProjectMembers(projectId);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(Role.MEMBER);
      expect(result[1].role).toBe(Role.ADMIN);
    });
  });
});
