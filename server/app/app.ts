import { AppServices } from '@common/types/AppServices';
import SwaggerConfig from '@configuration/swagger';
import logger from '@utils/logger';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { injectable } from 'tsyringe';

@injectable()
class App {
  private readonly app: Application;
  private readonly services: AppServices;

  constructor(app: Application, services: AppServices) {
    this.app = app;
    this.services = services;
    this.initiateMiddleware();
    this.initiateRoutes();
    this.initiateErrorHandler();
  }

  initiateMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(this.services.authMiddleware.authenticate);
  }

  initiateRoutes() {
    this.app.use('/api/auth', this.services.authController.router);
    this.app.use(
      '/api/health-check',
      this.services.healthCheckController.router
    );
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(SwaggerConfig.specs())
    );
  }

  initiateErrorHandler() {
    this.app.use(
      this.services.globalExceptionMiddleware.resourceNotFoundHandler
    );
    this.app.use(this.services.globalExceptionMiddleware.allExceptionHandler);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  }
}

export default App;
