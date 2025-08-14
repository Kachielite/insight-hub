import { container } from 'tsyringe';

import type { ProjectDataSource } from '@/features/Project/data/datasource/project-datasource.ts';
import type { ProjectRepository } from '@/features/Project/domain/repositories/project-repository.ts';
import {
  AcceptInviteUseCase,
  configureProjectContainers,
  CreateProjectUseCase,
  DeleteProjectUseCase,
  GetProjectByIdUseCase,
  GetUserProjectsUseCase,
  InviteMemberUseCase,
  RemoveMemberUseCase,
  UpdateProjectUseCase,
  VerifyInviteUseCase,
} from '@/init-dependencies/project-di.ts';

jest.mock('@/core/network/axios-client.ts', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getInstance: jest.fn(() => ({})),
    })),
  };
});

describe('Project Dependency Injection', () => {
  beforeEach(() => {
    container.clearInstances();
    configureProjectContainers();
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should register all project use case dependencies', () => {
    expect(() => container.resolve(AcceptInviteUseCase)).not.toThrow();
    expect(() => container.resolve(CreateProjectUseCase)).not.toThrow();
    expect(() => container.resolve(DeleteProjectUseCase)).not.toThrow();
    expect(() => container.resolve(GetProjectByIdUseCase)).not.toThrow();
    expect(() => container.resolve(GetUserProjectsUseCase)).not.toThrow();
    expect(() => container.resolve(InviteMemberUseCase)).not.toThrow();
    expect(() => container.resolve(RemoveMemberUseCase)).not.toThrow();
    expect(() => container.resolve(UpdateProjectUseCase)).not.toThrow();
    expect(() => container.resolve(VerifyInviteUseCase)).not.toThrow();
  });

  it('should resolve the same instance for singleton use cases', () => {
    const useCase1 = container.resolve(CreateProjectUseCase);
    const useCase2 = container.resolve(CreateProjectUseCase);
    expect(useCase1).toBe(useCase2);
  });

  it('should resolve repository and data source dependencies', () => {
    expect(() =>
      container.resolve<ProjectRepository>('ProjectRepository')
    ).not.toThrow();
    expect(() =>
      container.resolve<ProjectDataSource>('ProjectDataSource')
    ).not.toThrow();
  });

  it('should properly inject dependencies into use cases', () => {
    const useCase = container.resolve(CreateProjectUseCase);
    expect(useCase).toBeDefined();
    expect(typeof useCase.execute).toBe('function');
  });
});
