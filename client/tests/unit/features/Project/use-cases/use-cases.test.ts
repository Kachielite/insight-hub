import * as E from 'fp-ts/lib/Either';
import { container } from 'tsyringe';

import type { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';
import {
  AcceptInviteUseCase,
  AcceptInviteUseCaseParams,
} from '@/features/Project/domain/use-case/accept-invite.ts';
import {
  CreateProjectUseCase,
  CreateProjectUseCaseParams,
} from '@/features/Project/domain/use-case/create-project.ts';
import {
  DeleteProjectUseCase,
  DeleteProjectUseCaseParams,
} from '@/features/Project/domain/use-case/delete-project.ts';
import { GetUserProjectsUseCase } from '@/features/Project/domain/use-case/get-user-projects.ts';
import {
  UpdateProjectUseCase,
  UpdateProjectUseCaseParams,
} from '@/features/Project/domain/use-case/update-project.ts';
import {
  VerifyInviteUseCase,
  VerifyInviteUseCaseParams,
} from '@/features/Project/domain/use-case/verify-invite.ts';

import { mockProjectApiResponses } from '../../../../fixtures/project-fixtures.ts';

// Mock the repository
const mockProjectRepository: jest.Mocked<ProjectRepository> = {
  createProject: jest.fn(),
  getUserProjects: jest.fn(),
  getProjectById: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  inviteMemberToProject: jest.fn(),
  removeMemberFromProject: jest.fn(),
  acceptInviteToProject: jest.fn(),
  verifyInviteToken: jest.fn(),
};

describe('Project Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    container.registerInstance<ProjectRepository>(
      'ProjectRepository',
      mockProjectRepository
    );
  });

  describe('CreateProjectUseCase', () => {
    it('should successfully create a project', async () => {
      mockProjectRepository.createProject.mockResolvedValue(
        E.right(mockProjectApiResponses.createProjectSuccess)
      );
      const useCase = container.resolve(CreateProjectUseCase);
      const params = new CreateProjectUseCaseParams({
        projectName: 'Project Alpha',
      });
      const result = await useCase.execute(params);
      expect(E.isRight(result)).toBe(true);
      expect(mockProjectRepository.createProject).toHaveBeenCalledWith({
        projectName: 'Project Alpha',
      });
    });
    it('should return error on create failure', async () => {
      mockProjectRepository.createProject.mockResolvedValue(
        E.left(mockProjectApiResponses.apiError)
      );
      const useCase = container.resolve(CreateProjectUseCase);
      const params = new CreateProjectUseCaseParams({
        projectName: 'Project Alpha',
      });
      const result = await useCase.execute(params);
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe('GetUserProjectsUseCase', () => {
    it('should return user projects', async () => {
      mockProjectRepository.getUserProjects.mockResolvedValue(
        E.right(mockProjectApiResponses.getUserProjectsSuccess)
      );
      const useCase = container.resolve(GetUserProjectsUseCase);
      const result = await useCase.execute({});
      expect(E.isRight(result)).toBe(true);
      expect(mockProjectRepository.getUserProjects).toHaveBeenCalled();
    });
    it('should return error on failure', async () => {
      mockProjectRepository.getUserProjects.mockResolvedValue(
        E.left(mockProjectApiResponses.apiError)
      );
      const useCase = container.resolve(GetUserProjectsUseCase);
      const result = await useCase.execute({});
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe('UpdateProjectUseCase', () => {
    it('should update a project', async () => {
      mockProjectRepository.updateProject.mockResolvedValue(
        E.right(mockProjectApiResponses.updateProjectSuccess)
      );
      const useCase = container.resolve(UpdateProjectUseCase);
      const params = new UpdateProjectUseCaseParams({
        projectId: 1,
        projectName: 'Project Alpha Updated',
      });
      const result = await useCase.execute(params);
      expect(E.isRight(result)).toBe(true);
      expect(mockProjectRepository.updateProject).toHaveBeenCalledWith({
        projectId: 1,
        projectName: 'Project Alpha Updated',
      });
    });
    it('should return error on update failure', async () => {
      mockProjectRepository.updateProject.mockResolvedValue(
        E.left(mockProjectApiResponses.apiError)
      );
      const useCase = container.resolve(UpdateProjectUseCase);
      const params = new UpdateProjectUseCaseParams({
        projectId: 1,
        projectName: 'Project Alpha Updated',
      });
      const result = await useCase.execute(params);
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe('DeleteProjectUseCase', () => {
    it('should delete a project', async () => {
      mockProjectRepository.deleteProject.mockResolvedValue(E.right(undefined));
      const useCase = container.resolve(DeleteProjectUseCase);
      const params = new DeleteProjectUseCaseParams(1);
      const result = await useCase.execute(params);
      expect(E.isRight(result)).toBe(true);
      expect(mockProjectRepository.deleteProject).toHaveBeenCalledWith(1);
    });
    it('should return error on delete failure', async () => {
      mockProjectRepository.deleteProject.mockResolvedValue(
        E.left(mockProjectApiResponses.apiError)
      );
      const useCase = container.resolve(DeleteProjectUseCase);
      const params = new DeleteProjectUseCaseParams(1);
      const result = await useCase.execute(params);
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe('VerifyInviteUseCase', () => {
    it('should verify invite token', async () => {
      mockProjectRepository.verifyInviteToken.mockResolvedValue(
        E.right(mockProjectApiResponses.inviteVerificationSuccess)
      );
      const useCase = container.resolve(VerifyInviteUseCase);
      const params = new VerifyInviteUseCaseParams('token123');
      const result = await useCase.execute(params);
      expect(E.isRight(result)).toBe(true);
      expect(mockProjectRepository.verifyInviteToken).toHaveBeenCalledWith(
        'token123'
      );
    });
    it('should return error on verification failure', async () => {
      mockProjectRepository.verifyInviteToken.mockResolvedValue(
        E.left(mockProjectApiResponses.apiError)
      );
      const useCase = container.resolve(VerifyInviteUseCase);
      const params = new VerifyInviteUseCaseParams('token123');
      const result = await useCase.execute(params);
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe('AcceptInviteUseCase', () => {
    it('should accept invite', async () => {
      mockProjectRepository.acceptInviteToProject.mockResolvedValue(
        E.right(undefined)
      );
      const useCase = container.resolve(AcceptInviteUseCase);
      const params = new AcceptInviteUseCaseParams('token123');
      const result = await useCase.execute(params);
      expect(E.isRight(result)).toBe(true);
      expect(mockProjectRepository.acceptInviteToProject).toHaveBeenCalledWith(
        'token123'
      );
    });
    it('should return error on accept failure', async () => {
      mockProjectRepository.acceptInviteToProject.mockResolvedValue(
        E.left(mockProjectApiResponses.apiError)
      );
      const useCase = container.resolve(AcceptInviteUseCase);
      const params = new AcceptInviteUseCaseParams('token123');
      const result = await useCase.execute(params);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
