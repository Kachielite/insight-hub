import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { NotAuthenticatedException, NotAuthorizedException } from '@/exception';
import logger from '../utils/logger';
import JwtService from '@service/implementation/JwtService';
import UserRepository from '@repository/implementation/UserRepository';
import { CustomJwtPayload } from '@common/types/express';

@injectable()
class AuthenticationMiddleware {
  private readonly excludedRoutes: string[] = [
    '/api/health-check',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password-link',
    '/api/auth/reset-password',
    '/api/auth/refresh-token',
  ];
  private readonly excludedPrefixes: string[] = ['/api-docs'];

  constructor(
    @inject(JwtService) private readonly jwtService: JwtService,
    @inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  public authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const path = req.path;

    // Skip authentication for excluded routes
    if (
      this.excludedRoutes.includes(path) ||
      this.excludedPrefixes.some((prefix) => path.startsWith(prefix))
    ) {
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new NotAuthorizedException('No token provided');
    }

    try {
      const decoded = (await this.jwtService.verifyToken(
        token
      )) as CustomJwtPayload;
      if (!decoded?.userId) {
        throw new NotAuthorizedException('Invalid or expired token');
      }

      const user = await this.userRepository.findUserById(decoded.userId);
      if (!user) {
        throw new NotAuthenticatedException('User not found');
      }

      req.user = decoded;
      next();
    } catch (error) {
      logger.error(`Error while verifying token: ${error}`);
      if (
        error instanceof NotAuthenticatedException ||
        error instanceof NotAuthorizedException
      ) {
        return next(error);
      }
      next(error);
    }
  };
}

export default AuthenticationMiddleware;
