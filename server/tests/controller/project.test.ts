import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import request from 'supertest';
import { container } from 'tsyringe';

import ProjectController from '@controller/ProjectController';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import ProjectDTO from '@dto/ProjectDTO';
import HttpError from '@exception/http-error';
import ProjectMemberService from '@service/implementation/ProjectMemberService';
import ProjectService from '@service/implementation/ProjectService';
import { IProjectMember } from '@service/IProjectMember';
import { IProjectService } from '@service/IProjectService';

jest.setTimeout(30000);

// Mock the getUserIdFromRequest function
jest.mock('@utils/GetUserID', () => ({
  getUserIdFromRequest: jest.fn().mockReturnValue(1), // Mock user ID 1 for all requests
}));

// Mock ProjectService
class MockProjectService implements IProjectService {
  createProject = jest.fn();
  findProjectById = jest.fn();
  findProjectsByUserId = jest.fn();
  updateProject = jest.fn();
  deleteProject = jest.fn();
}

// Mock ProjectMemberService
class MockProjectMemberService implements IProjectMember {
  addProjectMember = jest.fn();
  acceptInvitation = jest.fn();
  removeProjectMember = jest.fn();
  verifyInvitationToken = jest.fn();
}

const mockProjectService = new MockProjectService();
const mockProjectMemberService = new MockProjectMemberService();

describe('ProjectController', () => {
  let app: Application;

  beforeAll(async () => {
    // Create a new container for testing to avoid conflicts
    const testContainer = container.createChildContainer();

    // set up express server
    app = express();
    app.use(express.json());

    // Register mock service using interface token instead of concrete class
    testContainer.register<IProjectService>(ProjectService, {
      useValue: mockProjectService,
    });
    testContainer.register<IProjectMember>(ProjectMemberService, {
      useValue: mockProjectMemberService,
    });

    // create router and controller using test container
    const router = Router();
    testContainer.registerInstance('Router', router);

    // Explicitly resolve controller to register routes
    testContainer.resolve(ProjectController);

    // Make sure router is properly set up before mounting
    app.use('/projects', router);

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

  describe('POST /projects', () => {
    const projectData = {
      projectName: 'Test Project',
    };

    it('should create a project and return 201', async () => {
      const mockProject = new ProjectDTO(
        1,
        projectData.projectName,
        new Date().toISOString()
      );
      const mockResponse: GeneralResponseDTO<ProjectDTO> = {
        code: 201,
        message: `Project ${projectData.projectName} created`,
        data: mockProject,
      };

      mockProjectService.createProject.mockResolvedValueOnce(mockResponse);

      const response = await request(app)
        .post('/projects')
        .send(projectData)
        .set('Authorization', 'Bearer mock-token'); // Add Authorization header

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResponse);
      expect(mockProjectService.createProject).toHaveBeenCalledWith(
        projectData.projectName,
        1 // This should match the mocked user ID
      );
    });

    it('should return 400 when project data is invalid', async () => {
      const error = {
        code: 400,
        message: 'Invalid request body.',
        name: 'Bad Request',
      };
      mockProjectService.createProject.mockRejectedValueOnce(error);

      const response = await request(app).post('/projects').send(projectData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockProjectService.createProject).toHaveBeenCalledWith(
        projectData.projectName,
        expect.any(Number)
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      const error = {
        code: 401,
        message: 'User not authenticated',
        name: 'UnauthorizedException',
      };
      mockProjectService.createProject.mockRejectedValueOnce(error);

      const response = await request(app).post('/projects').send(projectData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual(error);
      expect(mockProjectService.createProject).toHaveBeenCalledWith(
        projectData.projectName,
        expect.any(Number)
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: 'Internal server error during project creation',
        name: 'InternalServerException',
      };
      mockProjectService.createProject.mockRejectedValueOnce(error);

      const response = await request(app).post('/projects').send(projectData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockProjectService.createProject).toHaveBeenCalledWith(
        projectData.projectName,
        expect.any(Number)
      );
    });
  });

  describe('GET /projects/:projectId', () => {
    const projectId = 1;

    it('should return a project by ID', async () => {
      const mockProject = new ProjectDTO(
        projectId,
        'Test Project',
        new Date().toISOString()
      );
      const mockResponse: GeneralResponseDTO<ProjectDTO> = {
        code: 200,
        message: `Project ${projectId} found`,
        data: mockProject,
      };

      mockProjectService.findProjectById.mockResolvedValueOnce(mockResponse);

      const response = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockProjectService.findProjectById).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 400 when project ID is invalid', async () => {
      const error = {
        code: 400,
        message: 'Invalid project ID',
        name: 'Bad Request',
      };
      mockProjectService.findProjectById.mockRejectedValueOnce(error);

      const response = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockProjectService.findProjectById).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      const error = {
        code: 401,
        message: 'User not authenticated',
        name: 'UnauthorizedException',
      };
      mockProjectService.findProjectById.mockRejectedValueOnce(error);

      const response = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual(error);
      expect(mockProjectService.findProjectById).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 404 when project not found', async () => {
      const error = {
        code: 404,
        message: `Project with ID ${projectId} not found`,
        name: 'Resource Not Found',
      };
      mockProjectService.findProjectById.mockRejectedValueOnce(error);

      const response = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
      expect(mockProjectService.findProjectById).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: 'Internal server error during project retrieval',
        name: 'InternalServerException',
      };
      mockProjectService.findProjectById.mockRejectedValueOnce(error);

      const response = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockProjectService.findProjectById).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });
  });

  describe('GET /projects/user', () => {
    it('should return all projects for user', async () => {
      const mockProjects = [
        new ProjectDTO(1, 'Test Project 1', new Date().toISOString()),
        new ProjectDTO(2, 'Test Project 2', new Date().toISOString()),
      ];
      const mockResponse: GeneralResponseDTO<ProjectDTO[]> = {
        code: 200,
        message: 'Projects found for user',
        data: mockProjects,
      };

      mockProjectService.findProjectsByUserId.mockResolvedValueOnce(
        mockResponse
      );

      const response = await request(app)
        .get('/projects/user')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockProjectService.findProjectsByUserId).toHaveBeenCalledWith(
        expect.any(Number)
      );
    }, 30000);

    // Create a single test for error handling to simplify and make tests faster
    it('should handle errors appropriately', async () => {
      // 401 error
      const unauthorizedError = {
        code: 401,
        message: 'User not authenticated',
        name: 'UnauthorizedException',
      };

      mockProjectService.findProjectsByUserId.mockRejectedValueOnce(
        unauthorizedError
      );

      const unauthorizedResponse = await request(app)
        .get('/projects/user')
        .set('Authorization', 'Bearer mock-token');

      expect(unauthorizedResponse.status).toBe(401);

      // Reset and test 500 error
      const serverError = {
        code: 500,
        message: 'Internal server error',
        name: 'InternalServerException',
      };

      mockProjectService.findProjectsByUserId.mockRejectedValueOnce(
        serverError
      );

      const errorResponse = await request(app)
        .get('/projects/user')
        .set('Authorization', 'Bearer mock-token');

      expect(errorResponse.status).toBe(500);
    }, 30000); // Increased timeout
  });

  describe('PUT /projects/:projectId', () => {
    const projectId = 1;
    const updateData = {
      projectName: 'Updated Project Name',
    };

    it('should update a project and return 200', async () => {
      const mockProject = new ProjectDTO(
        projectId,
        updateData.projectName,
        new Date().toISOString()
      );
      const mockResponse: GeneralResponseDTO<ProjectDTO> = {
        code: 200,
        message: `Project ${projectId} updated successfully`,
        data: mockProject,
      };

      mockProjectService.updateProject.mockResolvedValueOnce(mockResponse);

      const response = await request(app)
        .put(`/projects/${projectId}`)
        .send(updateData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId,
        updateData.projectName
      );
    });

    it('should return 400 when update data is invalid', async () => {
      const error = {
        code: 400,
        message: 'Invalid request body.',
        name: 'Bad Request',
      };
      mockProjectService.updateProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .put(`/projects/${projectId}`)
        .send(updateData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId,
        updateData.projectName
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      const error = {
        code: 401,
        message: 'User not authenticated',
        name: 'UnauthorizedException',
      };
      mockProjectService.updateProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .put(`/projects/${projectId}`)
        .send(updateData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual(error);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId,
        updateData.projectName
      );
    });

    it('should return 404 when project not found', async () => {
      const error = {
        code: 404,
        message: `Project with ID ${projectId} not found`,
        name: 'Resource Not Found',
      };
      mockProjectService.updateProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .put(`/projects/${projectId}`)
        .send(updateData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId,
        updateData.projectName
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: 'Internal server error during project update',
        name: 'InternalServerException',
      };
      mockProjectService.updateProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .put(`/projects/${projectId}`)
        .send(updateData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId,
        updateData.projectName
      );
    });
  });

  describe('DELETE /projects/:projectId', () => {
    const projectId = 1;

    it('should delete a project and return 200', async () => {
      const mockResponse: GeneralResponseDTO<null> = {
        code: 200,
        message: `Project ${projectId} deleted successfully`,
        data: null,
      };

      mockProjectService.deleteProject.mockResolvedValueOnce(mockResponse);

      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 400 when project ID is invalid', async () => {
      const error = {
        code: 400,
        message: 'Invalid project ID',
        name: 'Bad Request',
      };
      mockProjectService.deleteProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      const error = {
        code: 401,
        message: 'User not authenticated',
        name: 'UnauthorizedException',
      };
      mockProjectService.deleteProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual(error);
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 404 when project not found', async () => {
      const error = {
        code: 404,
        message: `Project with ID ${projectId} not found`,
        name: 'Resource Not Found',
      };
      mockProjectService.deleteProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });

    it('should return 500 for any other error', async () => {
      const error = {
        code: 500,
        message: 'Internal server error during project deletion',
        name: 'InternalServerException',
      };
      mockProjectService.deleteProject.mockRejectedValueOnce(error);

      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(error);
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(
        expect.any(Number),
        projectId
      );
    });
  });

  describe('POST /projects/:projectId/members', () => {
    const projectId = 1;
    const inviteData = {
      memberEmail: 'team.member@example.com',
    };

    it('should invite a member and return 200', async () => {
      const mockResponse: GeneralResponseDTO<null> = {
        code: 200,
        message: 'Invitation sent successfully',
        data: null,
      };

      mockProjectMemberService.addProjectMember.mockResolvedValueOnce(
        mockResponse
      );

      const response = await request(app)
        .post(`/projects/${projectId}/members`)
        .send(inviteData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockProjectMemberService.addProjectMember).toHaveBeenCalledWith(
        1,
        projectId,
        inviteData.memberEmail
      );
    });

    it('should return 400 when invite data is invalid', async () => {
      const error = {
        code: 400,
        message: 'Invalid email format',
        name: 'Bad Request',
      };
      mockProjectMemberService.addProjectMember.mockRejectedValueOnce(error);

      const response = await request(app)
        .post(`/projects/${projectId}/members`)
        .send(inviteData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockProjectMemberService.addProjectMember).toHaveBeenCalledWith(
        1,
        projectId,
        inviteData.memberEmail
      );
    });

    it('should return 404 when project not found', async () => {
      const error = {
        code: 404,
        message: `Project with ID ${projectId} not found`,
        name: 'Resource Not Found',
      };
      mockProjectMemberService.addProjectMember.mockRejectedValueOnce(error);

      const response = await request(app)
        .post(`/projects/${projectId}/members`)
        .send(inviteData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual(error);
      expect(mockProjectMemberService.addProjectMember).toHaveBeenCalledWith(
        1,
        projectId,
        inviteData.memberEmail
      );
    });
  });

  describe('POST /projects/members/accept', () => {
    const token = 'valid-invitation-token';

    it('should accept invitation successfully', async () => {
      const mockResponse: GeneralResponseDTO<null> = {
        code: 200,
        message: 'Invitation accepted successfully',
        data: null,
      };

      mockProjectMemberService.acceptInvitation.mockResolvedValueOnce(
        mockResponse
      );

      const response = await request(app)
        .post(`/projects/members/accept?token=${token}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(mockProjectMemberService.acceptInvitation).toHaveBeenCalledWith(
        token,
        1
      );
    });

    it('should return 400 when token is invalid', async () => {
      const error = {
        code: 400,
        message: 'Invalid invitation token',
        name: 'Bad Request',
      };
      mockProjectMemberService.acceptInvitation.mockRejectedValueOnce(error);

      const response = await request(app)
        .post(`/projects/members/accept?token=${token}`)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect(mockProjectMemberService.acceptInvitation).toHaveBeenCalledWith(
        token,
        1
      );
    });
  });
});
