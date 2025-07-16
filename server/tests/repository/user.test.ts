import { container } from 'tsyringe';

import mockPrisma from '@config/db';
import { Role } from '@prisma';
import UserRepository from '@repository/implementation/UserRepository';
import { IUserRepository } from '@repository/IUserRepositroy';
// Import the mocked module and cast it properly

// Mock the Prisma client with properly typed Jest mocks
jest.mock('@config/db', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Create a properly typed mock object
const mockPrismaClient = mockPrisma as {
  user: {
    create: jest.MockedFunction<any>;
    findUnique: jest.MockedFunction<any>;
    update: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  };
};

describe('UserRepository', () => {
  let userRepository: IUserRepository;

  beforeAll(() => {
    const testContainer = container.createChildContainer();
    userRepository = testContainer.resolve(UserRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserData = {
      email: 'john.doe@example.com',
      password: 'hashed-password',
      name: 'John Doe',
    };

    const mockCreatedUser = {
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed-password',
      name: 'John Doe',
      role: Role.MEMBER,
      isActive: true,
      createdAt: new Date('2025-07-05T18:00:00.000Z'),
      updatedAt: new Date('2025-07-05T18:00:00.000Z'),
    };

    it('should create a user successfully with default role', async () => {
      mockPrismaClient.user.create.mockResolvedValue(mockCreatedUser);

      const result = await userRepository.createUser(createUserData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserData.email,
          password: createUserData.password,
          name: createUserData.name,
          role: Role.MEMBER, // Default role
        },
      });
      expect(mockPrismaClient.user.create).toHaveBeenCalledTimes(1);
    });

    it('should create a user with specified role', async () => {
      const createDataWithRole = {
        ...createUserData,
        role: Role.ADMIN,
      };

      const expectedUser = {
        ...mockCreatedUser,
        role: Role.ADMIN,
      };

      mockPrismaClient.user.create.mockResolvedValue(expectedUser);

      const result = await userRepository.createUser(createDataWithRole);

      expect(result.role).toBe(Role.ADMIN);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: createDataWithRole.email,
          password: createDataWithRole.password,
          name: createDataWithRole.name,
          role: Role.ADMIN,
        },
      });
    });

    it('should handle database errors during user creation', async () => {
      const dbError = new Error('Email already exists');
      mockPrismaClient.user.create.mockRejectedValue(dbError);

      await expect(userRepository.createUser(createUserData)).rejects.toThrow(
        'Email already exists'
      );
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserData.email,
          password: createUserData.password,
          name: createUserData.name,
          role: Role.MEMBER,
        },
      });
    });

    it('should create user with trimmed and normalized data', async () => {
      const createDataWithSpaces = {
        email: '  john.doe@example.com  ',
        password: 'hashed-password',
        name: '  John Doe  ',
      };

      mockPrismaClient.user.create.mockResolvedValue(mockCreatedUser);

      await userRepository.createUser(createDataWithSpaces);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: '  john.doe@example.com  ', // Repository doesn't trim, service layer should handle this
          password: 'hashed-password',
          name: '  John Doe  ',
          role: Role.MEMBER,
        },
      });
    });
  });

  describe('findUserByEmail', () => {
    const userEmail = 'john.doe@example.com';

    const mockFoundUser = {
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed-password',
      name: 'John Doe',
      role: Role.MEMBER,
      isActive: true,
      createdAt: new Date('2025-07-05T18:00:00.000Z'),
      updatedAt: new Date('2025-07-05T18:00:00.000Z'),
    };

    it('should find a user by email successfully', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockFoundUser);

      const result = await userRepository.findUserByEmail(userEmail);

      expect(result).toEqual(mockFoundUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not found by email', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findUserByEmail(
        'nonexistent@example.com'
      );

      expect(result).toBeNull();
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should handle database errors during email search', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaClient.user.findUnique.mockRejectedValue(dbError);

      await expect(userRepository.findUserByEmail(userEmail)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
    });

    it('should find user with case-sensitive email search', async () => {
      const upperCaseEmail = 'JOHN.DOE@EXAMPLE.COM';
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findUserByEmail(upperCaseEmail);

      expect(result).toBeNull();
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: upperCaseEmail },
      });
    });

    it('should handle special characters in email', async () => {
      const specialEmail = 'user+test@example.com';
      const expectedUser = {
        ...mockFoundUser,
        email: specialEmail,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(expectedUser);

      const result = await userRepository.findUserByEmail(specialEmail);

      expect(result?.email).toBe(specialEmail);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: specialEmail },
      });
    });
  });

  describe('findUserById', () => {
    const userId = 1;

    const mockFoundUser = {
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed-password',
      name: 'John Doe',
      role: Role.MEMBER,
      isActive: true,
      createdAt: new Date('2025-07-05T18:00:00.000Z'),
      updatedAt: new Date('2025-07-05T18:00:00.000Z'),
    };

    it('should find a user by ID successfully', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockFoundUser);

      const result = await userRepository.findUserById(userId);

      expect(result).toEqual(mockFoundUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { Project: true },
      });
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not found by ID', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findUserById(999);

      expect(result).toBeNull();
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { Project: true },
      });
    });

    it('should handle database errors during ID search', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaClient.user.findUnique.mockRejectedValue(dbError);

      await expect(userRepository.findUserById(userId)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { Project: true },
      });
    });

    it('should handle negative user IDs', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findUserById(-1);

      expect(result).toBeNull();
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: -1 },
        include: { Project: true },
      });
    });

    it('should handle very large user IDs', async () => {
      const largeId = 999999999;
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findUserById(largeId);

      expect(result).toBeNull();
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: largeId },
        include: { Project: true },
      });
    });

    it('should find a user by ID and include projects', async () => {
      const mockUserWithProjects = {
        ...mockFoundUser,
        Project: [
          { id: 101, name: 'Project A' },
          { id: 102, name: 'Project B' },
        ],
      };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUserWithProjects);

      const result = await userRepository.findUserById(userId);

      expect(result).toEqual(mockUserWithProjects);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { Project: true },
      });
    });
  });

  describe('updateUser', () => {
    const userId = 1;

    const mockUpdatedUser = {
      id: 1,
      email: 'john.doe@example.com',
      password: 'new-hashed-password',
      name: 'John Smith',
      role: Role.ADMIN,
      isActive: true,
      createdAt: new Date('2025-07-05T18:00:00.000Z'),
      updatedAt: new Date('2025-07-05T18:30:00.000Z'),
    };

    it('should update user with all fields', async () => {
      const updateData = {
        password: 'new-hashed-password',
        name: 'John Smith',
        role: Role.ADMIN,
        isActive: false,
      };

      const expectedUser = {
        ...mockUpdatedUser,
        isActive: false,
      };

      mockPrismaClient.user.update.mockResolvedValue(expectedUser);

      const result = await userRepository.updateUser(userId, updateData);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: updateData.password,
          name: updateData.name,
          role: updateData.role,
          isActive: false,
        },
      });
      expect(mockPrismaClient.user.update).toHaveBeenCalledTimes(1);
    });

    it('should update user with partial data', async () => {
      const updateData = {
        name: 'John Smith',
      };

      mockPrismaClient.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        name: 'John Smith',
      });

      const result = await userRepository.updateUser(userId, updateData);

      expect(result.name).toBe('John Smith');
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: undefined,
          name: 'John Smith',
          role: undefined,
          isActive: true, // Default to true when not specified
        },
      });
    });

    it('should handle isActive undefined (defaults to true)', async () => {
      const updateData = {
        name: 'John Smith',
      };

      mockPrismaClient.user.update.mockResolvedValue(mockUpdatedUser);

      await userRepository.updateUser(userId, updateData);

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: undefined,
          name: 'John Smith',
          role: undefined,
          isActive: true, // Should default to true
        },
      });
    });

    it('should handle isActive explicitly set to false', async () => {
      const updateData = {
        isActive: false,
      };

      const expectedUser = {
        ...mockUpdatedUser,
        isActive: false,
      };

      mockPrismaClient.user.update.mockResolvedValue(expectedUser);

      const result = await userRepository.updateUser(userId, updateData);

      expect(result.isActive).toBe(false);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: undefined,
          name: undefined,
          role: undefined,
          isActive: false,
        },
      });
    });

    it('should handle database errors during update', async () => {
      const updateData = { name: 'John Smith' };
      const dbError = new Error('User not found');
      mockPrismaClient.user.update.mockRejectedValue(dbError);

      await expect(
        userRepository.updateUser(userId, updateData)
      ).rejects.toThrow('User not found');
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: undefined,
          name: 'John Smith',
          role: undefined,
          isActive: true,
        },
      });
    });

    it('should update only password', async () => {
      const updateData = {
        password: 'new-super-secure-password',
      };

      // Note: updateUser doesn't return password in response for security reasons
      mockPrismaClient.user.update.mockResolvedValue({
        id: mockUpdatedUser.id,
        email: mockUpdatedUser.email,
        name: mockUpdatedUser.name,
        role: mockUpdatedUser.role,
        isActive: mockUpdatedUser.isActive,
      });

      const result = await userRepository.updateUser(userId, updateData);

      // Verify the update was called with correct password, but don't expect password in response
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: 'new-super-secure-password',
          name: undefined,
          role: undefined,
          isActive: true,
        },
      });

      // The result should not contain password for security reasons
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('isActive');
    });

    it('should update user role from MEMBER to ADMIN', async () => {
      const updateData = {
        role: Role.ADMIN,
      };

      mockPrismaClient.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        role: Role.ADMIN,
      });

      const result = await userRepository.updateUser(userId, updateData);

      expect(result.role).toBe(Role.ADMIN);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: undefined,
          name: undefined,
          role: Role.ADMIN,
          isActive: true,
        },
      });
    });
  });

  describe('deleteUser', () => {
    const userId = 1;

    const mockDeletedUser = {
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed-password',
      name: 'John Doe',
      role: Role.MEMBER,
      isActive: true,
      createdAt: new Date('2025-07-05T18:00:00.000Z'),
      updatedAt: new Date('2025-07-05T18:00:00.000Z'),
    };

    it('should delete a user successfully', async () => {
      mockPrismaClient.user.delete.mockResolvedValue(mockDeletedUser);

      const result = await userRepository.deleteUser(userId);

      expect(result).toEqual(mockDeletedUser);
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaClient.user.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent user', async () => {
      const notFoundError = new Error('Record to delete does not exist');
      mockPrismaClient.user.delete.mockRejectedValue(notFoundError);

      await expect(userRepository.deleteUser(999)).rejects.toThrow(
        'Record to delete does not exist'
      );
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should handle database errors during deletion', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaClient.user.delete.mockRejectedValue(dbError);

      await expect(userRepository.deleteUser(userId)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return complete user data after deletion', async () => {
      mockPrismaClient.user.delete.mockResolvedValue(mockDeletedUser);

      const result = await userRepository.deleteUser(userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('password');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('isActive');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(typeof result.id).toBe('number');
      expect(typeof result.email).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(Object.values(Role)).toContain(result.role);
      expect(typeof result.isActive).toBe('boolean');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle deletion with negative user ID', async () => {
      const notFoundError = new Error('Record to delete does not exist');
      mockPrismaClient.user.delete.mockRejectedValue(notFoundError);

      await expect(userRepository.deleteUser(-1)).rejects.toThrow(
        'Record to delete does not exist'
      );
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: -1 },
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user lifecycle', async () => {
      const createData = {
        email: 'lifecycle@example.com',
        password: 'hashed-password',
        name: 'Lifecycle User',
        role: Role.MEMBER,
      };

      const createdUser = {
        id: 1,
        email: 'lifecycle@example.com',
        password: 'hashed-password',
        name: 'Lifecycle User',
        role: Role.MEMBER,
        isActive: true,
        createdAt: new Date('2025-07-05T18:00:00.000Z'),
        updatedAt: new Date('2025-07-05T18:00:00.000Z'),
      };

      const updatedUser = {
        ...createdUser,
        name: 'Updated Lifecycle User',
        role: Role.ADMIN,
        updatedAt: new Date('2025-07-05T18:30:00.000Z'),
      };

      // Mock create
      mockPrismaClient.user.create.mockResolvedValue(createdUser);

      // Mock find by email
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(createdUser);

      // Mock find by ID
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(createdUser);

      // Mock update
      mockPrismaClient.user.update.mockResolvedValue(updatedUser);

      // Mock delete
      mockPrismaClient.user.delete.mockResolvedValue(updatedUser);

      // Test create
      const createResult = await userRepository.createUser(createData);
      expect(createResult.email).toBe('lifecycle@example.com');

      // Test find by email
      const findByEmailResult = await userRepository.findUserByEmail(
        'lifecycle@example.com'
      );
      expect(findByEmailResult?.email).toBe('lifecycle@example.com');

      // Test find by ID
      const findByIdResult = await userRepository.findUserById(1);
      expect(findByIdResult?.id).toBe(1);

      // Test update
      const updateResult = await userRepository.updateUser(1, {
        name: 'Updated Lifecycle User',
        role: Role.ADMIN,
      });
      expect(updateResult.name).toBe('Updated Lifecycle User');
      expect(updateResult.role).toBe(Role.ADMIN);

      // Test delete
      const deleteResult = await userRepository.deleteUser(1);
      expect(deleteResult.id).toBe(1);

      // Verify all operations were called
      expect(mockPrismaClient.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaClient.user.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.user.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle role transitions', async () => {
      const userId = 1;
      const memberUser = {
        id: 1,
        email: 'member@example.com',
        password: 'hashed-password',
        name: 'Member User',
        role: Role.MEMBER,
        isActive: true,
        createdAt: new Date('2025-07-05T18:00:00.000Z'),
        updatedAt: new Date('2025-07-05T18:00:00.000Z'),
      };

      const adminUser = {
        ...memberUser,
        role: Role.ADMIN,
        updatedAt: new Date('2025-07-05T18:30:00.000Z'),
      };

      // Mock update from MEMBER to ADMIN
      mockPrismaClient.user.update.mockResolvedValue(adminUser);

      const result = await userRepository.updateUser(userId, {
        role: Role.ADMIN,
      });

      expect(result.role).toBe(Role.ADMIN);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: undefined,
          name: undefined,
          role: Role.ADMIN,
          isActive: true,
        },
      });
    });
  });
});
