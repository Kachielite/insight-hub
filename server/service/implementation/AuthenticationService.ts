import { Request } from 'express';
import { inject, injectable } from 'tsyringe';
import { IAuthenticationService } from '@service/IAuthenticationService';
import PasswordEncoderService from '@service/implementation/PasswordEncoderService';
import {
  AuthenticationDTO,
  AuthTokenDTO,
  PasswordResetDTO,
  RegistrationDTO,
} from '@/dto/AuthenticationDTO';
import GeneralResponseDTO from '@/dto/GeneralResponseDTO';
import logger from '@utils/logger';
import {
  BadRequestException,
  InternalServerException,
  NotAuthorizedException,
  ResourceNotFoundException,
} from '@/exception';
import EmailService from '@service/implementation/EmailService';
import PasswordResetTokenRepository from '@repository/implementation/PasswordResetTokenRepository';
import TokenGenerator from '@utils/TokenGenerator';
import UserRepository from '@repository/implementation/UserRepository';
import JwtService from '@service/implementation/JwtService';

@injectable()
class AuthenticationService implements IAuthenticationService {
  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(JwtService) private readonly jwtService: JwtService,
    @inject(PasswordEncoderService)
    private readonly passwordEncoderService: PasswordEncoderService,
    @inject(EmailService) private readonly emailService: EmailService,
    @inject(PasswordResetTokenRepository)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository
  ) {}

  async login({
    email,
    password,
  }: AuthenticationDTO): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    try {
      logger.info(`Logging in user with email: ${email}`);

      // Check if user exists
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new ResourceNotFoundException(
          `User with email ${email} does not exist`
        );
      }

      // Verify password
      const isPasswordValid =
        await this.passwordEncoderService.comparePasswords(
          password,
          user.password
        );
      if (!isPasswordValid) {
        throw new NotAuthorizedException('Invalid email or password');
      }

      // Generate access and refresh tokens
      const accessToken = await this.jwtService.generateToken(
        user.id,
        'access'
      );
      const refreshToken = await this.jwtService.generateToken(
        user.id,
        'refresh'
      );
      const authTokenDTO = new AuthTokenDTO(accessToken, refreshToken);

      return new GeneralResponseDTO<AuthTokenDTO>(
        200,
        'Login successful',
        authTokenDTO
      );
    } catch (error) {
      logger.error(`Error logging in user: ${error}`);
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof NotAuthorizedException
      ) {
        throw error;
      }
      throw new InternalServerException('Internal server error during login');
    }
  }

  async register({
    email,
    password,
    name,
  }: RegistrationDTO): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    try {
      logger.info(`Logging in user with email: ${email}`);

      // Check if user already exists
      const existingUser = await this.userRepository.findUserByEmail(email);
      if (existingUser) {
        throw new BadRequestException(
          `User with email ${email} already exists`
        );
      }

      // Hash password
      const hashedPassword =
        await this.passwordEncoderService.hashPassword(password);

      // Create new user
      const user = await this.userRepository.createUser({
        email,
        password: hashedPassword,
        name,
      });

      // Generate access and refresh tokens
      const accessToken = await this.jwtService.generateToken(
        user.id,
        'access'
      );
      const refreshToken = await this.jwtService.generateToken(
        user.id,
        'refresh'
      );
      const authTokenDTO = new AuthTokenDTO(accessToken, refreshToken);

      return new GeneralResponseDTO<AuthTokenDTO>(
        201,
        'User registered successfully',
        authTokenDTO
      );
    } catch (error) {
      logger.error(`Error registering user: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerException(
        'Internal server error during registration'
      );
    }
  }

  async resetPasswordLink(email: string): Promise<GeneralResponseDTO<string>> {
    try {
      logger.info(`Requesting reset password link for : ${email}`);

      // Check if user exists
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new ResourceNotFoundException(
          `User with email ${email} does not exist`
        );
      }

      // Generate reset password token
      const token = TokenGenerator.generateToken();
      const userId = user.id;
      const expiresIn = new Date(Date.now() + 15 * 60 * 1000);
      const resetPasswordToken = await this.passwordResetTokenRepository.create(
        {
          userId,
          token,
          expiresAt: expiresIn,
        }
      );

      // Send reset password email
      const resetLink = `http://localhost:3000/reset-password?token=${resetPasswordToken.token}`;
      await this.emailService.sendPasswordResetEmail(email, resetLink);

      return new GeneralResponseDTO<string>(
        200,
        'Reset password link sent successfully',
        resetLink
      );
    } catch (error) {
      logger.error(`Error requesting reset password link: ${error}`);
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new InternalServerException(
        'Internal server error during reset password link request'
      );
    }
  }

  async resetPassword({
    email,
    newPassword,
  }: PasswordResetDTO): Promise<GeneralResponseDTO<string>> {
    try {
      logger.info(`Resetting password for user with email: ${email}`);

      // Check if user exists
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new ResourceNotFoundException(
          `User with email ${email} does not exist`
        );
      }

      // Hash new password
      const hashedPassword =
        await this.passwordEncoderService.hashPassword(newPassword);

      // Update user's password
      await this.userRepository.updateUser(user.id, {
        password: hashedPassword,
      });

      return new GeneralResponseDTO<string>(
        200,
        'Password reset successfully',
        'Password has been reset successfully'
      );
    } catch (error) {
      logger.error(`Error resetting password: ${error}`);
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new InternalServerException(
        'Internal server error during password reset'
      );
    }
  }

  async refreshToken(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    try {
      logger.info(`Refreshing token for user`);
      const bearerToken = req.headers.authorization;

      // Extract refresh token from request
      const refreshToken = bearerToken?.split(' ')[1];

      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required');
      }

      // Verify and decode the refresh token
      const payload = await this.jwtService.verifyToken(refreshToken);
      if (!payload) {
        throw new NotAuthorizedException('Invalid or expired refresh token');
      }

      // Check if user exists
      const user = await this.userRepository.findUserById(payload.userId);
      if (!user) {
        throw new ResourceNotFoundException(`User does not exist`);
      }

      // Generate new access token
      const accessToken = await this.jwtService.generateToken(
        user.id,
        'access'
      );
      const authTokenDTO = new AuthTokenDTO(accessToken, refreshToken);

      return new GeneralResponseDTO<AuthTokenDTO>(
        200,
        'Token refreshed successfully',
        authTokenDTO
      );
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`);
      if (
        error instanceof BadRequestException ||
        error instanceof NotAuthorizedException ||
        error instanceof ResourceNotFoundException
      ) {
        throw error;
      }
      throw new InternalServerException(
        'Internal server error during token refresh'
      );
    }
  }
}

export default AuthenticationService;
