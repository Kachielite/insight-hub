import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { injectable } from 'tsyringe';
import logger from '@utils/logger';
import { AppServices } from '@common/types/AppServices';
import swaggerUi from 'swagger-ui-express';
import SwaggerConfig from '@configuration/swagger';

@injectable()
class App {
  private readonly app: Application;
  private readonly services: AppServices;

  constructor(app: Application, services: AppServices) {
    this.app = app;
    this.services = services;
    this.initMiddleware();
    this.initRoutes();
    this.initiateErrorHandler();
  }

  initMiddleware() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(this.services.authMiddleware.authenticate);
  }

  initRoutes() {
    this.app.use('/api/auth', this.services.authController.router);
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
