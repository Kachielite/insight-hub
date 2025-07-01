import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { injectable } from 'tsyringe';
import logger from '../utils/logger';

@injectable()
class App {
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
    this.initMiddleware();
  }

  initMiddleware() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(cors());
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  }
}

export default App;
