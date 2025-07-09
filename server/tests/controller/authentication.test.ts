import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import request from 'supertest';
import { container } from 'tsyringe';

import AuthenticationController from '@controller/AuthenticationController';
import { AuthTokenDTO, PasswordResetDTO } from '@dto/AuthenticationDTO';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import HttpError from '@exception/http-error';
import { IAuthenticationService } from '@service/IAuthenticationService';
import AuthenticationService from '@service/implementation/AuthenticationService';

// Create a proper mock class that satisfies the AuthenticationService interface
class MockAuthenticationService implements IAuthenticationService {
  login = jest.fn();
  register = jest.fn();
  resetPasswordLink = jest.fn();
  resetPassword = jest.fn();
  refreshToken = jest.fn();
}

// Create an instance of our mock
const mockAuthenticationService = new MockAuthenticationService();

// Set up test environment
describe('AuthenticationController', () => {
  let app: Application;

  beforeAll(async () => {
    // Create a new container for testing to avoid conflicts
    const testContainer = container.createChildContainer();

    // set up express server
    app = express();
    app.use(express.json());

    // Register mock service using interface token instead of concrete class
    testContainer.register<IAuthenticationService>(AuthenticationService, {
      useValue: mockAuthenticationService,
    });

    // create router and controller using test container
    const router = Router();
    testContainer.registerInstance('Router', router);

    testContainer.resolve(AuthenticationController);
    app.use('/auth', router);

    // Add error handling middleware with correct Express types
    app.use(
      (error: HttpError, req: Request, res: Response, _next: NextFunction) => {
        if (error.code) {
          res.status(error.code).json({
            code: error.code,
            message: error.message,
            name: error.name,
          });
        } else {
          res.status(500).json({
            code: 500,
            message: 'Internal Server Error',
            name: 'InternalServerException',
          });
        }
      }
    );
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    const loginData = {
      email: 'john.doe@mail.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      const mockResponse: GeneralResponseDTO<AuthTokenDTO> = {
        code: 200,
        message: 'Login successfully',
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      mockAuthenticationService.login.mockResolvedValueOnce(mockResponse);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockAuthenticationService.login).toHaveBeenCalledWith(loginData);
    });

    it('should return 400 when login data is not right', async () => {
      const error = {
        code: 400,
        message: 'Invalid request body.',
        name: 'Bad Request',
      };
      mockAuthenticationService.login.mockRejectedValueOnce(error);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.login).toHaveBeenCalledWith(loginData);
    });

    it('should return 403 when wrong credentials are provided', async () => {
      const error = {
        code: 403,
        message: 'Invalid email or password',
        name: 'Not Authorized',
      };
      mockAuthenticationService.login.mockRejectedValueOnce(error);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(403);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.login).toHaveBeenCalledWith(loginData);
    });

    it('should return 404 when user does not exist', async () => {
      const error = {
        code: 404,
        message: `User with email ${loginData.email} does not exist`,
        name: 'Resource Not Found',
      };
      mockAuthenticationService.login.mockRejectedValueOnce(error);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.login).toHaveBeenCalledWith(loginData);
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: `Internal server error during login`,
        name: 'Not Authorized',
      };
      mockAuthenticationService.login.mockRejectedValueOnce(error);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.login).toHaveBeenCalledWith(loginData);
    });
  });

  describe('GET /auth/register', () => {
    const registerData = {
      email: 'john.doe@mail.com',
      password: 'password123',
      name: 'John Doe',
    };

    it('should return 201 if registration is successful', async () => {
      const mockResponse: GeneralResponseDTO<AuthTokenDTO> = {
        code: 201,
        message: 'Registration successful',
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      mockAuthenticationService.register.mockResolvedValueOnce(mockResponse);

      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResponse);
      expect(mockAuthenticationService.register).toHaveBeenCalledWith(
        registerData
      );
    });

    it('should return 400 when registration data is not right', async () => {
      const error = {
        code: 400,
        message: 'Invalid request body.',
        name: 'Bad Request',
      };
      mockAuthenticationService.register.mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.register).toHaveBeenCalledWith(
        registerData
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: `Internal server error during login`,
        name: 'Not Authorized',
      };
      mockAuthenticationService.register.mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.register).toHaveBeenCalledWith(
        registerData
      );
    });
  });

  describe('POST /auth/reset-password', () => {
    const email = 'john.doe@mail.com';
    const resetPasswordPath = `/auth/reset-password-link?email=${email}`;
    const resetLink = 'https://localhost:3000/reset-password-link';

    it('should send reset password link sent successfully', async () => {
      const mockResponse: GeneralResponseDTO<string> = {
        code: 200,
        message: 'Reset password link sent successfully',
        data: resetLink,
      };

      mockAuthenticationService.resetPasswordLink.mockResolvedValueOnce(
        mockResponse
      );

      const response = await request(app).get(resetPasswordPath);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockAuthenticationService.resetPasswordLink).toHaveBeenCalledWith(
        email
      );
    });

    it('should return 404 when email does not exist', async () => {
      const error = {
        code: 404,
        message: `User with email ${email} does not exist`,
        name: 'Resource Not Found',
      };
      mockAuthenticationService.resetPasswordLink.mockRejectedValueOnce(error);

      const response = await request(app).get(resetPasswordPath);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.resetPasswordLink).toHaveBeenCalledWith(
        email
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: `Internal server error during login`,
        name: 'Not Authorized',
      };
      mockAuthenticationService.resetPasswordLink.mockRejectedValueOnce(error);

      const response = await request(app).get(resetPasswordPath);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.resetPasswordLink).toHaveBeenCalledWith(
        email
      );
    });
  });

  describe('POST /auth/reset-password', () => {
    const requestBody: PasswordResetDTO = {
      email: 'john.doe@mail.com',
      newPassword: 'newpassword123',
      resetToken: 'valid-reset-token',
    };

    const resetPasswordPath = '/auth/reset-password';

    it('should reset password successfully', async () => {
      const mockResponse: GeneralResponseDTO<string> = {
        code: 200,
        message: 'Password reset successfully',
        data: 'Password has been reset successfully',
      };

      mockAuthenticationService.resetPassword.mockResolvedValueOnce(
        mockResponse
      );

      const response = await request(app)
        .post(resetPasswordPath)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockAuthenticationService.resetPassword).toHaveBeenCalledWith(
        requestBody
      );
    });

    it('should return 400 when reset password data is not right', async () => {
      const error = {
        code: 400,
        message: 'Invalid request body.',
        name: 'Bad Request',
      };
      mockAuthenticationService.resetPassword.mockRejectedValueOnce(error);

      const response = await request(app)
        .post(resetPasswordPath)
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.resetPassword).toHaveBeenCalledWith(
        requestBody
      );
    });

    it('should return 404 when email does not exist', async () => {
      const error = {
        code: 404,
        message: `User with email ${requestBody.email} does not exist`,
        name: 'Resource Not Found',
      };
      mockAuthenticationService.resetPassword.mockRejectedValueOnce(error);

      const response = await request(app)
        .post(resetPasswordPath)
        .send(requestBody);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.resetPassword).toHaveBeenCalledWith(
        requestBody
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: `Internal server error during login`,
        name: 'Not Authorized',
      };
      mockAuthenticationService.resetPassword.mockRejectedValueOnce(error);

      const response = await request(app)
        .post(resetPasswordPath)
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.resetPassword).toHaveBeenCalledWith(
        requestBody
      );
    });
  });

  describe('POST /auth/refresh-token', () => {
    const refreshTokenPath = '/auth/refresh-token';
    const refreshToken = 'mock-refresh-token';

    it('should refresh token successfully', async () => {
      const mockResponse: GeneralResponseDTO<AuthTokenDTO> = {
        code: 200,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      mockAuthenticationService.refreshToken.mockResolvedValueOnce(
        mockResponse
      );

      const response = await request(app)
        .post(refreshTokenPath)
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockAuthenticationService.refreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: `Bearer ${refreshToken}`,
          }),
        })
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: 'Internal server error during token refresh',
        name: 'Token Error',
      };

      mockAuthenticationService.refreshToken.mockRejectedValueOnce(error);

      const response = await request(app)
        .post(refreshTokenPath)
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockAuthenticationService.refreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: `Bearer ${refreshToken}`,
          }),
        })
      );
    });
  });
});
