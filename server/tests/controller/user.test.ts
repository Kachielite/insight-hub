import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import request from 'supertest';
import { container } from 'tsyringe';

import UserController from '@controller/UserController';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { UserResponseDTO, UserUpdateDTO } from '@dto/UserDTO';
import HttpError from '@exception/http-error';
import UserService from '@service/implementation/UserService';
import { IUserService } from '@service/IUserService';

jest.setTimeout(15000);

// Mock the getUserIdFromRequest function
jest.mock('@utils/GetUserID', () => ({
  getUserIdFromRequest: jest.fn().mockReturnValue(1), // Mock user ID 1 for all requests
}));

// Mock UserService
class MockUserService implements IUserService {
  findUserById = jest.fn();
  updateUser = jest.fn();
  deleteUser = jest.fn();
}

const mockUserService = new MockUserService();

describe('UserController', () => {
  let app: Application;

  beforeAll(async () => {
    const testContainer = container.createChildContainer();
    app = express();
    app.use(express.json());

    testContainer.register<IUserService>(UserService, {
      useValue: mockUserService,
    });

    const router = Router();
    testContainer.registerInstance('Router', router);
    testContainer.resolve(UserController);
    app.use('/users', router);
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/me', () => {
    it('should return current user info', async () => {
      const mockUser = new UserResponseDTO(
        1,
        'John Doe',
        'john@example.com',
        'MEMBER',
        new Date()
      );
      const mockResponse: GeneralResponseDTO<UserResponseDTO> = {
        code: 200,
        message: 'User found successfully',
        data: mockUser,
      };
      mockUserService.findUserById.mockResolvedValueOnce(mockResponse);
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer mock-token');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(mockResponse)));
      expect(mockUserService.findUserById).toHaveBeenCalledWith(1);
    });

    it('should return 401 if not authenticated', async () => {
      const error = {
        code: 401,
        message: 'Unauthorized',
        name: 'UnauthorizedException',
      };
      mockUserService.findUserById.mockRejectedValueOnce(error);
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(401);
      expect(response.body).toEqual(error);
    });
  });

  describe('PUT /users', () => {
    it('should update user info', async () => {
      const updateData = new UserUpdateDTO(undefined, undefined, 'Jane Doe');
      const mockUser = new UserResponseDTO(
        1,
        'Jane Doe',
        'john@example.com',
        'MEMBER',
        new Date()
      );
      const mockResponse: GeneralResponseDTO<UserResponseDTO> = {
        code: 200,
        message: 'User updated successfully',
        data: mockUser,
      };
      mockUserService.updateUser.mockResolvedValueOnce(mockResponse);
      const response = await request(app)
        .put('/users')
        .send(updateData)
        .set('Authorization', 'Bearer mock-token');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(mockResponse)));
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: 'Jane Doe' })
      );
    });

    it('should return 400 for invalid update', async () => {
      const error = {
        code: 400,
        message: 'Invalid update',
        name: 'BadRequestException',
      };
      mockUserService.updateUser.mockRejectedValueOnce(error);
      const response = await request(app).put('/users').send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
    });
  });

  describe('DELETE /users', () => {
    it('should delete user', async () => {
      const mockResponse: GeneralResponseDTO<string> = {
        code: 200,
        message: 'User deleted successfully',
        data: 'User with ID 1 has been deleted',
      };
      mockUserService.deleteUser.mockResolvedValueOnce(mockResponse);
      const response = await request(app)
        .delete('/users')
        .set('Authorization', 'Bearer mock-token');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should return 404 if user not found', async () => {
      const error = {
        code: 404,
        message: 'User not found',
        name: 'ResourceNotFoundException',
      };
      mockUserService.deleteUser.mockRejectedValueOnce(error);
      const response = await request(app).delete('/users');
      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
    });
  });
});
