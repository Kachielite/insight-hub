import jwt, { JwtPayload } from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';

import { BadRequestException } from '@/exception';

import { Constants } from '@configuration/constants';
import UserRepository from '@repository/implementation/UserRepository';
import { IJwtService } from '@service/IJwtService';
import logger from '@utils/logger';

@injectable()
class JwtService implements IJwtService {
  private readonly SECRET_KEY = Constants.JWT_SECRET as string;
  private readonly ACCESS_TOKEN_EXPIRY =
    Constants.JWT_ACCESS_TOKEN_EXPIRY as unknown as number;
  private readonly REFRESH_TOKEN_EXPIRY =
    Constants.JWT_REFRESH_TOKEN_EXPIRY as unknown as number;

  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async generateToken(
    userId: number,
    type: 'access' | 'refresh'
  ): Promise<string> {
    try {
      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      const payload = {
        userId: user.id,
        role: user.role,
      };

      return jwt.sign(payload, this.SECRET_KEY, {
        expiresIn:
          type === 'access'
            ? this.ACCESS_TOKEN_EXPIRY
            : this.REFRESH_TOKEN_EXPIRY,
        algorithm: 'HS256',
      });
    } catch (error) {
      logger.error(`Error generating token for user ${userId}: ${error}`);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return jwt.verify(token, this.SECRET_KEY) as JwtPayload;
    } catch (error) {
      logger.error(`Error verifying access token: ${error}`);
      throw new BadRequestException('Invalid access token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Verify the refresh token
      const payload = jwt.verify(refreshToken, this.SECRET_KEY) as JwtPayload;

      if (!payload) {
        throw new BadRequestException('Invalid refresh token');
      }

      // Check if the user exists
      const user = await this.userRepository.findUserById(payload.userId);

      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      // Generate a new access token
      return this.generateToken(user.id, 'access');
    } catch (error) {
      logger.error(`Error refreshing access token: ${error}`);
      throw new BadRequestException('Invalid refresh token');
    }
  }
}

export default JwtService;
