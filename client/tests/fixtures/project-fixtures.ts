import InviteVerificationModel from '@/features/Project/data/model/invite-verification-model.ts';

export const mockProjectApiResponses = {
  createProjectSuccess: {
    id: '1',
    name: 'Project Alpha',
    createdAt: '2024-01-01T00:00:00.000Z',
    members: [],
  },
  getUserProjectsSuccess: [
    {
      id: '1',
      name: 'Project Alpha',
      createdAt: '2024-01-01T00:00:00.000Z',
      members: [],
    },
    {
      id: '2',
      name: 'Project Beta',
      createdAt: '2024-02-01T00:00:00.000Z',
      members: [],
    },
  ],
  getProjectByIdSuccess: {
    id: '1',
    name: 'Project Alpha',
    createdAt: '2024-01-01T00:00:00.000Z',
    members: [],
  },
  updateProjectSuccess: {
    id: '1',
    name: 'Project Alpha Updated',
    createdAt: '2024-01-01T00:00:00.000Z',
    members: [],
  },
  inviteVerificationSuccess: new InviteVerificationModel(true, false),
  apiError: new Error('Network error'),
};
