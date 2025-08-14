import * as E from 'fp-ts/lib/Either';

import { ServerException } from '@/core/error/server.ts';
import ProjectRepositoryImpl from '@/features/Project/data/repositories/project-repository-impl.ts';

import { mockProjectApiResponses } from '../../../../fixtures/project-fixtures.ts';

// Mock the data source
const mockProjectDataSource = {
  createProject: jest.fn(),
  getUserProjects: jest.fn(),
  getProjectById: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  inviteMemberToProject: jest.fn(),
  removeMemberFromProject: jest.fn(),
  acceptInviteToProject: jest.fn(),
  verifyInviteToken: jest.fn(),
} as any;

describe('ProjectRepository', () => {
  let projectRepository: ProjectRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    projectRepository = new ProjectRepositoryImpl(mockProjectDataSource as any);
  });

  describe('createProject', () => {
    it('should return project data on successful creation', async () => {
      mockProjectDataSource.createProject.mockResolvedValue(
        mockProjectApiResponses.createProjectSuccess
      );
      const result = await projectRepository.createProject({} as any);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(
          mockProjectApiResponses.createProjectSuccess
        );
      }
    });

    it('should return error on failed creation', async () => {
      const error = new ServerException('Create failed');
      mockProjectDataSource.createProject.mockRejectedValue(error);
      const result = await projectRepository.createProject({} as any);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe('Create failed');
      }
    });
  });

  describe('getUserProjects', () => {
    it('should return projects on success', async () => {
      mockProjectDataSource.getUserProjects.mockResolvedValue(
        mockProjectApiResponses.getUserProjectsSuccess
      );
      const result = await projectRepository.getUserProjects();
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(
          mockProjectApiResponses.getUserProjectsSuccess
        );
      }
    });
  });

  describe('getProjectById', () => {
    it('should return project on success', async () => {
      mockProjectDataSource.getProjectById.mockResolvedValue(
        mockProjectApiResponses.getProjectByIdSuccess
      );
      const result = await projectRepository.getProjectById(1);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(
          mockProjectApiResponses.getProjectByIdSuccess
        );
      }
    });
  });

  describe('updateProject', () => {
    it('should return updated project on success', async () => {
      mockProjectDataSource.updateProject.mockResolvedValue(
        mockProjectApiResponses.updateProjectSuccess
      );
      const result = await projectRepository.updateProject({} as any);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(
          mockProjectApiResponses.updateProjectSuccess
        );
      }
    });
  });

  describe('deleteProject', () => {
    it('should resolve on success', async () => {
      mockProjectDataSource.deleteProject.mockResolvedValue(undefined);
      const result = await projectRepository.deleteProject(1);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe('inviteMemberToProject', () => {
    it('should resolve on success', async () => {
      mockProjectDataSource.inviteMemberToProject.mockResolvedValue(undefined);
      const result = await projectRepository.inviteMemberToProject({} as any);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe('removeMemberFromProject', () => {
    it('should resolve on success', async () => {
      mockProjectDataSource.removeMemberFromProject.mockResolvedValue(
        undefined
      );
      const result = await projectRepository.removeMemberFromProject({} as any);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe('acceptInviteToProject', () => {
    it('should resolve on success', async () => {
      mockProjectDataSource.acceptInviteToProject.mockResolvedValue(undefined);
      const result = await projectRepository.acceptInviteToProject('token');
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe('verifyInviteToken', () => {
    it('should return verification model on success', async () => {
      mockProjectDataSource.verifyInviteToken.mockResolvedValue(
        mockProjectApiResponses.inviteVerificationSuccess
      );
      const result = await projectRepository.verifyInviteToken('token');
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(
          mockProjectApiResponses.inviteVerificationSuccess
        );
      }
    });
  });
});
