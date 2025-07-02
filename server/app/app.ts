import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { inject, injectable } from 'tsyringe';
import AuthenticationMiddleware from '@middleware/AuthenticationMiddleware';
import logger from '@utils/logger';
import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';

@injectable()
class App {
  private readonly app: Application;

  constructor(
    app: Application,
    @inject(AuthenticationMiddleware)
    private authMiddleware: AuthenticationMiddleware,
    @inject(GlobalExceptionMiddleware)
    private globalExceptionMiddleware: GlobalExceptionMiddleware
  ) {
    this.app = app;
    this.initMiddleware();
    this.initiateErrorHandler();
  }

  initMiddleware() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(this.authMiddleware.authenticate);
  }

  initiateErrorHandler() {
    this.app.use(this.globalExceptionMiddleware.resourceNotFoundHandler);
    this.app.use(this.globalExceptionMiddleware.allExceptionHandler);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  }
}

export default App;
