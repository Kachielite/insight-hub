import ProjectEndpoints from '@/features/Project/data/datasource/network/project.ts';
import ProjectDataSourceImpl from '@/features/Project/data/datasource/project-datasource.ts';
import ProjectModel from '@/features/Project/data/model/project-model.ts';

import { mockProjectApiResponses } from '../../../../fixtures/project-fixtures.ts';

// Mock the network layer
const mockProjectEndpoints = {
  createProject: jest.fn(),
  getUserProjects: jest.fn(),
  getProjectById: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  inviteMemberToProject: jest.fn(),
  removeMemberFromProject: jest.fn(),
  acceptInviteToProject: jest.fn(),
  verifyInviteToProject: jest.fn(),
} as jest.Mocked<
  Pick<
    ProjectEndpoints,
    | 'createProject'
    | 'getUserProjects'
    | 'getProjectById'
    | 'updateProject'
    | 'deleteProject'
    | 'inviteMemberToProject'
    | 'removeMemberFromProject'
    | 'acceptInviteToProject'
    | 'verifyInviteToProject'
  >
>;

describe('ProjectDataSource', () => {
  let projectDataSource: ProjectDataSourceImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    projectDataSource = new ProjectDataSourceImpl(
      mockProjectEndpoints as unknown as ProjectEndpoints
    );
  });

  describe('createProject', () => {
    it('should return project data on successful API call', async () => {
      mockProjectEndpoints.createProject.mockResolvedValue(
        mockProjectApiResponses.createProjectSuccess
      );
      const result = await projectDataSource.createProject({} as any);
      expect(result).toBeInstanceOf(ProjectModel);
      expect(mockProjectEndpoints.createProject).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.createProject.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(
        projectDataSource.createProject({} as any)
      ).rejects.toThrow();
    });
  });

  describe('getUserProjects', () => {
    it('should return array of project data on successful API call', async () => {
      mockProjectEndpoints.getUserProjects.mockResolvedValue(
        mockProjectApiResponses.getUserProjectsSuccess
      );
      const result = await projectDataSource.getUserProjects();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(ProjectModel);
      expect(mockProjectEndpoints.getUserProjects).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.getUserProjects.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(projectDataSource.getUserProjects()).rejects.toThrow();
    });
  });

  describe('getProjectById', () => {
    it('should return project data on successful API call', async () => {
      mockProjectEndpoints.getProjectById.mockResolvedValue(
        mockProjectApiResponses.getProjectByIdSuccess
      );
      const result = await projectDataSource.getProjectById(1);
      expect(result).toBeInstanceOf(ProjectModel);
      expect(mockProjectEndpoints.getProjectById).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.getProjectById.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(projectDataSource.getProjectById(1)).rejects.toThrow();
    });
  });

  describe('updateProject', () => {
    it('should return updated project data on successful API call', async () => {
      mockProjectEndpoints.updateProject.mockResolvedValue(
        mockProjectApiResponses.updateProjectSuccess
      );
      const result = await projectDataSource.updateProject({} as any);
      expect(result).toBeInstanceOf(ProjectModel);
      expect(mockProjectEndpoints.updateProject).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.updateProject.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(
        projectDataSource.updateProject({} as any)
      ).rejects.toThrow();
    });
  });

  describe('deleteProject', () => {
    it('should call deleteProject on successful API call', async () => {
      mockProjectEndpoints.deleteProject.mockResolvedValue(undefined);
      await expect(projectDataSource.deleteProject(1)).resolves.toBeUndefined();
      expect(mockProjectEndpoints.deleteProject).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.deleteProject.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(projectDataSource.deleteProject(1)).rejects.toThrow();
    });
  });

  describe('inviteMemberToProject', () => {
    it('should call inviteMemberToProject on successful API call', async () => {
      mockProjectEndpoints.inviteMemberToProject.mockResolvedValue(undefined);
      await expect(
        projectDataSource.inviteMemberToProject({} as any)
      ).resolves.toBeUndefined();
      expect(mockProjectEndpoints.inviteMemberToProject).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.inviteMemberToProject.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(
        projectDataSource.inviteMemberToProject({} as any)
      ).rejects.toThrow();
    });
  });

  describe('removeMemberFromProject', () => {
    it('should call removeMemberFromProject on successful API call', async () => {
      mockProjectEndpoints.removeMemberFromProject.mockResolvedValue(undefined);
      await expect(
        projectDataSource.removeMemberFromProject({} as any)
      ).resolves.toBeUndefined();
      expect(mockProjectEndpoints.removeMemberFromProject).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.removeMemberFromProject.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(
        projectDataSource.removeMemberFromProject({} as any)
      ).rejects.toThrow();
    });
  });

  describe('acceptInviteToProject', () => {
    it('should call acceptInviteToProject on successful API call', async () => {
      mockProjectEndpoints.acceptInviteToProject.mockResolvedValue(undefined);
      await expect(
        projectDataSource.acceptInviteToProject('token')
      ).resolves.toBeUndefined();
      expect(mockProjectEndpoints.acceptInviteToProject).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.acceptInviteToProject.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(
        projectDataSource.acceptInviteToProject('token')
      ).rejects.toThrow();
    });
  });

  describe('verifyInviteToken', () => {
    it('should return InviteVerificationModel on successful API call', async () => {
      mockProjectEndpoints.verifyInviteToProject.mockResolvedValue(
        mockProjectApiResponses.inviteVerificationSuccess
      );
      const result = await projectDataSource.verifyInviteToken('token');
      expect(result).toEqual(mockProjectApiResponses.inviteVerificationSuccess);
      expect(mockProjectEndpoints.verifyInviteToProject).toHaveBeenCalled();
    });
    it('should throw error on API failure', async () => {
      mockProjectEndpoints.verifyInviteToProject.mockRejectedValue(
        mockProjectApiResponses.apiError
      );
      await expect(
        projectDataSource.verifyInviteToken('token')
      ).rejects.toThrow();
    });
  });
});
