import AuthenticationController from '@controller/AuthenticationController';
import HealthCheckController from '@controller/HealthCheckController';
import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';

export interface AppServices {
  authMiddleware: AuthenticationMiddleware;
  globalExceptionMiddleware: GlobalExceptionMiddleware;
  healthCheckController: HealthCheckController;
  authController: AuthenticationController;
}
