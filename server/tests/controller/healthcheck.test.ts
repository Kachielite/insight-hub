import HealthCheckController from '@controller/HealthCheckController';
import HttpError from '@exception/http-error';
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import request from 'supertest';
import { container } from 'tsyringe';

describe('HealthCheckController', () => {
  let app: Application;

  beforeAll(async () => {
    // Create a new container for testing to avoid conflicts
    const testContainer = container.createChildContainer();

    // set up express server
    app = express();
    app.use(express.json());

    // create router and controller using test container
    const router = Router();
    testContainer.registerInstance('Router', router);

    // Create and register the HealthCheckController
    testContainer.resolve(HealthCheckController);
    app.use('/health-check', router); // Mount at /health-check path

    // Add error handling middleware with correct Express types
    app.use(
      (error: HttpError, req: Request, res: Response, _next: NextFunction) => {
        if (error.code) {
          res.status(error.code).json({
            code: error.code,
            message: error.message,
          });
        }
      }
    );
  });

  it('should pass a basic sanity check', async () => {
    const mockedResponse: string = 'Server is healthy and running';

    const response = await request(app).get('/health-check');

    expect(response.status).toBe(200);
    expect(response.body).toBe(mockedResponse);
  });
});
