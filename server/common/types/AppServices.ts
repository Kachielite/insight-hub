import AuthenticationController from '@controller/AuthenticationController';
import HealthCheckController from '@controller/HealthCheckController';
import ProjectController from '@controller/ProjectController';
import UserController from '@controller/UserController';
import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';

export interface AppServices {
  authMiddleware: AuthenticationMiddleware;
  globalExceptionMiddleware: GlobalExceptionMiddleware;
  healthCheckController: HealthCheckController;
  authController: AuthenticationController;
  projectController: ProjectController;
  userController: UserController;
}
