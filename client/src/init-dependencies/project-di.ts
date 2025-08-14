import { container } from 'tsyringe';

import AxiosClient from '@/core/network/axios-client.ts';
import ProjectEndpoints from '@/features/Project/data/datasource/network/project.ts';
import { AcceptInviteUseCase } from '@/features/Project/domain/use-case/accept-invite.ts';
import { CreateProjectUseCase } from '@/features/Project/domain/use-case/create-project.ts';
import { DeleteProjectUseCase } from '@/features/Project/domain/use-case/delete-project.ts';
import { GetProjectByIdUseCase } from '@/features/Project/domain/use-case/get-project-by-id.ts';
import { GetUserProjectsUseCase } from '@/features/Project/domain/use-case/get-user-projects.ts';
import { InviteMemberUseCase } from '@/features/Project/domain/use-case/invite-member.ts';
import { RemoveMemberUseCase } from '@/features/Project/domain/use-case/remove-member.ts';
import { UpdateProjectUseCase } from '@/features/Project/domain/use-case/update-project.ts';
import { VerifyInviteUseCase } from '@/features/Project/domain/use-case/verify-invite.ts';

export function configureProjectContainers(): void {
  // Register axios client using axios directly
  const axiosClient = new AxiosClient().getInstance();
  container.registerInstance('axiosClient', axiosClient);

  // Register network layer
  container.registerSingleton<ProjectEndpoints>(ProjectEndpoints);

  // Register data source
  container.register('ProjectDataSource', {
    useClass: ProjectEndpoints,
  });

  // Register repository
  container.register('ProjectRepository', {
    useClass: ProjectEndpoints,
  });

  // Register use cases
  container.registerSingleton<AcceptInviteUseCase>(AcceptInviteUseCase);
  container.registerSingleton<CreateProjectUseCase>(CreateProjectUseCase);
  container.registerSingleton<DeleteProjectUseCase>(DeleteProjectUseCase);
  container.registerSingleton<GetProjectByIdUseCase>(GetProjectByIdUseCase);
  container.registerSingleton<GetUserProjectsUseCase>(GetUserProjectsUseCase);
  container.registerSingleton<InviteMemberUseCase>(InviteMemberUseCase);
  container.registerSingleton<RemoveMemberUseCase>(RemoveMemberUseCase);
  container.registerSingleton<UpdateProjectUseCase>(UpdateProjectUseCase);
  container.registerSingleton<VerifyInviteUseCase>(VerifyInviteUseCase);
}

// Export use case classes for manual resolution
export {
  AcceptInviteUseCase,
  CreateProjectUseCase,
  DeleteProjectUseCase,
  GetProjectByIdUseCase,
  GetUserProjectsUseCase,
  InviteMemberUseCase,
  RemoveMemberUseCase,
  UpdateProjectUseCase,
  VerifyInviteUseCase,
};

// Helper function to get configured use cases
export function getProjectUseCases() {
  return {
    acceptInviteUseCase: container.resolve(AcceptInviteUseCase),
    createProjectUseCase: container.resolve(CreateProjectUseCase),
    deleteProjectUseCase: container.resolve(DeleteProjectUseCase),
    getProjectByIdUseCase: container.resolve(GetProjectByIdUseCase),
    getUserProjectsUseCase: container.resolve(GetUserProjectsUseCase),
    inviteMemberUseCase: container.resolve(InviteMemberUseCase),
    removeMemberUseCase: container.resolve(RemoveMemberUseCase),
    updateProjectUseCase: container.resolve(UpdateProjectUseCase),
    verifyInviteUseCase: container.resolve(VerifyInviteUseCase),
  };
}
