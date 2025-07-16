import { container } from 'tsyringe';

import { UserResponseDTO, UserUpdateDTO } from '@dto/UserDTO';
import { Role } from '@prisma';
import UserRepository from '@repository/implementation/UserRepository';
import PasswordEncoderService from '@service/implementation/PasswordEncoderService';
import UserService from '@service/implementation/UserService';

// Mock dependencies
const mockUserRepository = {
  findUserById: jest.fn(),
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

const mockPasswordEncoderService = {
  comparePasswords: jest.fn(),
  hashPassword: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeAll(() => {
    const testContainer = container.createChildContainer();

    // Register mocks
    testContainer.registerInstance(UserRepository, mockUserRepository as any);
    testContainer.registerInstance(
      PasswordEncoderService,
      mockPasswordEncoderService as any
    );

    userService = testContainer.resolve(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    const userId = 1;
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.MEMBER,
      password: 'hashed-password',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    };

    it('should find user by ID successfully', async () => {
      mockUserRepository.findUserById.mockResolvedValue(mockUser);

      const result = await userService.findUserById(userId);

      expect(result.code).toBe(200);
      expect(result.message).toBe('User found successfully');
      expect(result.data).toEqual(
        new UserResponseDTO(
          mockUser.id,
          mockUser.name,
          mockUser.email,
          mockUser.role,
          mockUser.createdAt,
          [] // explicitly expect empty array for projects
        )
      );
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      mockUserRepository.findUserById.mockResolvedValue(null);

      await expect(userService.findUserById(userId)).rejects.toThrow(
        `User with ID ${userId} not found`
      );
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException when user is not active', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findUserById.mockResolvedValue(inactiveUser);

      await expect(userService.findUserById(userId)).rejects.toThrow(
        `User with ID ${userId} is not active`
      );
    });

    it('should throw InternalServerError for unexpected errors', async () => {
      mockUserRepository.findUserById.mockRejectedValue(
        new Error('Database error')
      );

      await expect(userService.findUserById(userId)).rejects.toThrow(
        'Error finding user by ID'
      );
    });

    it('should find user by ID and include projects in response', async () => {
      const mockUserWithProjects = {
        ...mockUser,
        Project: [
          { id: 10, name: 'Project X', createdAt: new Date('2024-01-02') },
          { id: 11, name: 'Project Y', createdAt: new Date('2024-01-03') },
        ],
      };
      mockUserRepository.findUserById.mockResolvedValue(mockUserWithProjects);

      const result = await userService.findUserById(userId);

      expect(result.code).toBe(200);
      expect(result.message).toBe('User found successfully');
      expect(result.data?.projects).toHaveLength(2);
      expect(result.data?.projects?.[0].id).toBe(10);
      expect(result.data?.projects?.[0].name).toBe('Project X');
      expect(result.data?.projects?.[1].id).toBe(11);
      expect(result.data?.projects?.[1].name).toBe('Project Y');
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    const mockExistingUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.MEMBER,
      password: 'hashed-current-password',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    };

    const mockUpdatedUser = {
      ...mockExistingUser,
      name: 'Jane Doe',
      role: Role.ADMIN,
    };

    it('should update user successfully without password change', async () => {
      const updateData = new UserUpdateDTO(
        1,
        undefined,
        undefined,
        'Jane Doe',
        Role.ADMIN
      );

      mockUserRepository.findUserById.mockResolvedValue(mockExistingUser);
      mockUserRepository.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(updateData);

      expect(result.code).toBe(200);
      expect(result.message).toBe('User updated successfully');
      expect(result.data).toEqual(
        new UserResponseDTO(
          mockUpdatedUser.id,
          mockUpdatedUser.name,
          mockUpdatedUser.email,
          mockUpdatedUser.role,
          mockUpdatedUser.createdAt
        )
      );

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(1, {
        password: mockExistingUser.password,
        name: 'Jane Doe',
        role: Role.ADMIN,
        isActive: true,
      });
    });

    it('should update user with password change successfully', async () => {
      const updateData = new UserUpdateDTO(
        1,
        'current-password',
        'new-password',
        'Jane Doe'
      );

      mockUserRepository.findUserById.mockResolvedValue(mockExistingUser);
      mockPasswordEncoderService.comparePasswords.mockResolvedValue(true);
      mockPasswordEncoderService.hashPassword.mockResolvedValue(
        'hashed-new-password'
      );
      mockUserRepository.updateUser.mockResolvedValue({
        ...mockUpdatedUser,
        password: 'hashed-new-password',
      });

      const result = await userService.updateUser(updateData);

      expect(result.code).toBe(200);
      expect(result.message).toBe('User updated successfully');
      // Fixed: comparePasswords should be called with current password and existing hashed password
      expect(mockPasswordEncoderService.comparePasswords).toHaveBeenCalledWith(
        'current-password',
        'hashed-current-password' // This is the existing user's password from mockExistingUser
      );
      expect(mockPasswordEncoderService.hashPassword).toHaveBeenCalledWith(
        'new-password'
      );
    });

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      const updateData = new UserUpdateDTO(
        999,
        undefined,
        undefined,
        'Jane Doe'
      );

      mockUserRepository.findUserById.mockResolvedValue(null);

      await expect(userService.updateUser(updateData)).rejects.toThrow(
        'User with ID 999 not found'
      );
    });

    it('should throw BadRequestException when user is not active', async () => {
      const updateData = new UserUpdateDTO(1, undefined, undefined, 'Jane Doe');
      const inactiveUser = { ...mockExistingUser, isActive: false };

      mockUserRepository.findUserById.mockResolvedValue(inactiveUser);

      await expect(userService.updateUser(updateData)).rejects.toThrow(
        'User with ID 1 is not active'
      );
    });

    it('should throw ConflictException when current password is incorrect', async () => {
      const updateData = new UserUpdateDTO(1, 'wrong-password', 'new-password');

      mockUserRepository.findUserById.mockResolvedValue(mockExistingUser);
      mockPasswordEncoderService.comparePasswords.mockResolvedValue(false);

      await expect(userService.updateUser(updateData)).rejects.toThrow(
        'Current password is incorrect'
      );
    });

    it('should throw BadRequestException for invalid role', async () => {
      const updateData = new UserUpdateDTO(
        1,
        undefined,
        undefined,
        'Jane Doe',
        'INVALID_ROLE' as Role
      );

      mockUserRepository.findUserById.mockResolvedValue(mockExistingUser);

      await expect(userService.updateUser(updateData)).rejects.toThrow(
        'Invalid role: INVALID_ROLE'
      );
    });

    it('should trim whitespace from name', async () => {
      const updateData = new UserUpdateDTO(
        1,
        undefined,
        undefined,
        '  Jane Doe  '
      );

      mockUserRepository.findUserById.mockResolvedValue(mockExistingUser);
      mockUserRepository.updateUser.mockResolvedValue(mockUpdatedUser);

      await userService.updateUser(updateData);

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(1, {
        password: mockExistingUser.password,
        name: 'Jane Doe',
        role: mockExistingUser.role,
        isActive: true,
      });
    });

    it('should throw InternalServerError for unexpected errors', async () => {
      const updateData = new UserUpdateDTO(1, undefined, undefined, 'Jane Doe');

      mockUserRepository.findUserById.mockRejectedValue(
        new Error('Database error')
      );

      await expect(userService.updateUser(updateData)).rejects.toThrow(
        'Error updating user'
      );
    });
  });

  describe('deleteUser', () => {
    const userId = 1;
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.MEMBER,
      password: 'hashed-password',
      isActive: true,
      createdAt: new Date('2024-01-01'),
    };

    it('should delete user successfully (soft delete)', async () => {
      mockUserRepository.findUserById.mockResolvedValue(mockUser);
      mockUserRepository.updateUser.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await userService.deleteUser(userId);

      expect(result.code).toBe(200);
      expect(result.message).toBe('User deleted successfully');
      expect(result.data).toBe(`User with ID ${userId} has been deleted`);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, {
        isActive: false,
      });
    });

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      mockUserRepository.findUserById.mockResolvedValue(null);

      await expect(userService.deleteUser(userId)).rejects.toThrow(
        `User with ID ${userId} not found`
      );

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw InternalServerError for unexpected errors', async () => {
      mockUserRepository.findUserById.mockRejectedValue(
        new Error('Database error')
      );

      await expect(userService.deleteUser(userId)).rejects.toThrow(
        'Error deleting user'
      );
    });

    it('should delete user even if already inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findUserById.mockResolvedValue(inactiveUser);
      mockUserRepository.updateUser.mockResolvedValue(inactiveUser);

      const result = await userService.deleteUser(userId);

      expect(result.code).toBe(200);
      expect(result.message).toBe('User deleted successfully');
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, {
        isActive: false,
      });
    });
  });
});
