import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';
import AuthenticationController from '@controller/AuthenticationController';

export interface AppServices {
  authMiddleware: AuthenticationMiddleware;
  globalExceptionMiddleware: GlobalExceptionMiddleware;
  authController: AuthenticationController;
}
