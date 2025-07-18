import { InternalServerError } from 'http-errors';
import { inject, injectable } from 'tsyringe';

import { UserResponseDTO, UserUpdateDTO } from '@/dto/UserDTO';
import {
  BadRequestException,
  ConflictException,
  ResourceNotFoundException,
} from '@/exception';

import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import ProjectDTO from '@dto/ProjectDTO';
import { Role } from '@prisma';
import UserRepository from '@repository/implementation/UserRepository';
import PasswordEncoderService from '@service/implementation/PasswordEncoderService';
import { IUserService } from '@service/IUserService';
import logger from '@utils/logger';

@injectable()
class UserService implements IUserService {
  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(PasswordEncoderService)
    private readonly passwordEncoderService: PasswordEncoderService
  ) {}

  async findUserById(id: number): Promise<GeneralResponseDTO<UserResponseDTO>> {
    try {
      logger.info(`Finding user with ID: ${id}`);

      const user = await this.userRepository.findUserById(id);

      if (!user) {
        throw new ResourceNotFoundException(`User with ID ${id} not found`);
      }

      if (!user.isActive) {
        throw new BadRequestException(`User with ID ${id} is not active`);
      }

      const userResponse = new UserResponseDTO(
        user.id,
        user.name,
        user.email,
        user.role,
        user.createdAt,
        user.Project?.map(
          (project) =>
            new ProjectDTO(
              project.id,
              project.name,
              project.createdAt.toLocaleDateString()
            )
        ) ?? []
      );

      return new GeneralResponseDTO<UserResponseDTO>(
        200,
        'User found successfully',
        userResponse
      );
    } catch (e) {
      logger.error(`Error finding user by ID: ${e}`);

      if (
        e instanceof ResourceNotFoundException ||
        e instanceof BadRequestException
      ) {
        throw e;
      }
      throw new InternalServerError(`Error finding user by ID`);
    }
  }

  async updateUser(
    userId: number,
    userData: UserUpdateDTO
  ): Promise<GeneralResponseDTO<UserResponseDTO>> {
    try {
      logger.info(`Updating user with ID: ${userId}`);

      // Check if user exists
      const existingUser = await this.userRepository.findUserById(userId);

      if (!existingUser) {
        throw new ResourceNotFoundException(`User with ID ${userId} not found`);
      }

      if (!existingUser.isActive) {
        throw new BadRequestException(`User with ID ${userId} is not active`);
      }

      // Update user
      if (userData.currentPassword && userData.newPassword) {
        // Verify current password
        const isPasswordValid =
          await this.passwordEncoderService.comparePasswords(
            userData.currentPassword,
            existingUser.password
          );

        if (!isPasswordValid) {
          throw new ConflictException('Current password is incorrect');
        }
        // Hash new password
        existingUser.password = await this.passwordEncoderService.hashPassword(
          userData.newPassword
        );
      }

      if (userData.name) {
        userData.name = userData.name.trim();
      }

      if (userData.role) {
        if (!Object.values(Role).includes(userData.role)) {
          throw new BadRequestException(`Invalid role: ${userData.role}`);
        }
        existingUser.role = userData.role;
      }

      const updatedUser = await this.userRepository.updateUser(
        existingUser.id,
        {
          password: existingUser.password,
          name: userData.name ?? existingUser.name,
          role: userData.role ?? existingUser.role,
          isActive: true,
        }
      );

      const userResponse = new UserResponseDTO(
        updatedUser.id,
        updatedUser.name,
        updatedUser.email,
        updatedUser.role,
        updatedUser.createdAt
      );

      return new GeneralResponseDTO<UserResponseDTO>(
        200,
        'User updated successfully',
        userResponse
      );
    } catch (e) {
      logger.error(`Error updating user: ${e}`);

      if (
        e instanceof ResourceNotFoundException ||
        e instanceof BadRequestException ||
        e instanceof ConflictException
      ) {
        throw e;
      }
      throw new InternalServerError(`Error updating user`);
    }
  }

  async deleteUser(id: number): Promise<GeneralResponseDTO<string>> {
    try {
      logger.info(`Deleteing user with ID: ${id}`);

      // Check if user exists
      const existingUser = await this.userRepository.findUserById(id);

      if (!existingUser) {
        throw new ResourceNotFoundException(`User with ID ${id} not found`);
      }

      // soft delete user
      await this.userRepository.updateUser(id, { isActive: false });

      return new GeneralResponseDTO(
        200,
        'User deleted successfully',
        `User with ID ${id} has been deleted`
      );
    } catch (e) {
      logger.error(`Error deleting user: ${e}`);

      if (e instanceof ResourceNotFoundException) {
        throw e;
      }
      throw new InternalServerError(`Error deleting user`);
    }
  }
}

export default UserService;
