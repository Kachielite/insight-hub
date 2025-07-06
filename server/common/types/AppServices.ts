import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';
import AuthenticationController from '@controller/AuthenticationController';
import HealthCheckController from '@controller/HealthCheckController';

export interface AppServices {
  authMiddleware: AuthenticationMiddleware;
  globalExceptionMiddleware: GlobalExceptionMiddleware;
  healthCheckController: HealthCheckController;
  authController: AuthenticationController;
}
