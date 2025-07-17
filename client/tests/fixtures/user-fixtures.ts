import Role from '@/core/common/domain/entity/enum/role.ts';

export const testUsers = {
  validUser: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  invalidUser: {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'wrongpassword',
  },
  newUser: {
    id: '3',
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'alicepassword',
  },
};

export const mockUserApiResponses = {
  getUserSuccess: {
    id: 1, // Changed from string to number
    name: 'John Doe',
    email: 'john@example.com',
    role: Role.MEMBER, // Use Role enum
    createdAt: '2023-01-01T00:00:00.000Z',
    projects: [
      {
        id: 'p1',
        name: 'Project Alpha',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'p2',
        name: 'Project Beta',
        createdAt: '2024-02-01T00:00:00.000Z',
      },
    ],
  },
  getUserFailure: new Error('Network error'),
};
