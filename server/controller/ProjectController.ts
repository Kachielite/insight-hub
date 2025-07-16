import express, { Request } from 'express';
import { inject, injectable } from 'tsyringe';

import {
  BaseController,
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@common/decorators/ControllerDecorators';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import ProjectDTO from '@dto/ProjectDTO';
import { ProjectMemberTokenVerificationDTO } from '@dto/ProjectMemberDTO';
import { ProjectValidationSchema } from '@dto/RequestValidationSchema';
import ProjectMemberService from '@service/implementation/ProjectMemberService';
import ProjectService from '@service/implementation/ProjectService';
import { getUserIdFromRequest } from '@utils/GetUserID';

@injectable()
@Controller()
class ProjectController extends BaseController {
  constructor(
    @inject('Router') router: express.Router,
    @inject(ProjectService) private readonly projectService: ProjectService,
    @inject(ProjectMemberService)
    private readonly projectMemberService: ProjectMemberService
  ) {
    super(router);
  }

  /**
   * @swagger
   * /projects:
   *   post:
   *     summary: Create a new project
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               projectName:
   *                 type: string
   *                 description: Name of the project
   *             required:
   *               - projectName
   *     responses:
   *       201:
   *         description: Project created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProjectResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Post('/', {
    validate: ProjectValidationSchema.projectSchema,
    statusCode: 201,
  })
  public async createProject(
    req: Request
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    // Extract projectName from request body and userId from request
    const { projectName } = req.body;
    const userId = getUserIdFromRequest(req);

    // Call the project service to create a new project
    return await this.projectService.createProject(projectName, userId);
  }

  /**
   * @swagger
   * /projects/user:
   *   get:
   *     summary: Get all projects for the authenticated user
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of projects for the user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProjectListResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Get('/user')
  public async findProjectsByUserId(
    req: Request
  ): Promise<GeneralResponseDTO<ProjectDTO[]>> {
    // Extract userId from request
    const userId = getUserIdFromRequest(req);
    // Call the project service to find all projects by user ID
    return await this.projectService.findProjectsByUserId(userId);
  }

  /**
   * @swagger
   * /projects/{projectId}:
   *   get:
   *     summary: Get a project by ID
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: integer
   *         description: The ID of the project to retrieve
   *     responses:
   *       200:
   *         description: Project found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProjectResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       404:
   *         description: Project not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Get('/:projectId')
  public async findProjectById(
    req: Request
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    // Extract projectId from request parameters and userId from request
    const projectId = parseInt(req.params.projectId, 10);
    const userId = getUserIdFromRequest(req);

    // Call the project service to find the project by ID
    return await this.projectService.findProjectById(userId, projectId);
  }

  /**
   * @swagger
   * /projects/{projectId}:
   *   put:
   *     summary: Update a project by ID
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: integer
   *         description: The ID of the project to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               projectName:
   *                 type: string
   *                 description: The new name for the project
   *             required:
   *               - projectName
   *     responses:
   *       200:
   *         description: Project updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProjectResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       404:
   *         description: Project not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Put('/:projectId', {
    validate: ProjectValidationSchema.projectSchema,
  })
  public async updateProject(
    req: Request
  ): Promise<GeneralResponseDTO<ProjectDTO>> {
    // Extract projectId from request parameters, projectName from request body, and userId from request
    const projectId = parseInt(req.params.projectId, 10);
    const { projectName } = req.body;
    const userId = getUserIdFromRequest(req);
    // Call the project service to update the project
    return await this.projectService.updateProject(
      userId,
      projectId,
      projectName
    );
  }

  /**
   * @swagger
   * /projects/{projectId}:
   *   delete:
   *     summary: Delete a project by ID
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: integer
   *         description: The ID of the project to delete
   *     responses:
   *       200:
   *         description: Project deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       404:
   *         description: Project not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Delete('/:projectId')
  public async deleteProject(req: Request): Promise<GeneralResponseDTO<null>> {
    // Extract projectId from request parameters and userId from request
    const projectId = parseInt(req.params.projectId, 10);
    const userId = getUserIdFromRequest(req);
    // Call the project service to delete the project
    return await this.projectService.deleteProject(userId, projectId);
  }

  /**
   * @swagger
   * /projects/{projectId}/members:
   *   post:
   *     summary: Invite a member to a project
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: integer
   *         description: The ID of the project
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               memberEmail:
   *                 type: string
   *                 format: email
   *                 description: Email of the member to invite
   *             required:
   *               - memberEmail
   *     responses:
   *       200:
   *         description: Member invited successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       404:
   *         description: Project not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Post('/:projectId/members', {
    validate: ProjectValidationSchema.inviteSchema,
  })
  public async inviteMember(req: Request): Promise<GeneralResponseDTO<null>> {
    // Extract projectId from request parameters, memberEmail from request body, and userId from request
    const projectId = parseInt(req.params.projectId, 10);
    const { memberEmail } = req.body;
    const userId = getUserIdFromRequest(req);
    // Call the project service to invite a member to the project
    return await this.projectMemberService.addProjectMember(
      userId,
      projectId,
      memberEmail
    );
  }

  /**
   * @swagger
   * /projects/members/accept:
   *   post:
   *     summary: Accept a project invitation
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: The invitation token
   *     responses:
   *       200:
   *         description: Invitation accepted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       404:
   *         description: Not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Post('/members/accept')
  public async acceptInvitation(
    req: Request
  ): Promise<GeneralResponseDTO<null>> {
    // Extract token from request body and userId from request
    const token = req.query.token as string;
    const userId = getUserIdFromRequest(req);
    // Call the project member service to accept the invitation
    return await this.projectMemberService.acceptInvitation(token, userId);
  }

  /**
   * @swagger
   * /projects/{projectId}/members:
   *   delete:
   *     summary: Remove a member from a project
   *     tags:
   *       - Projects
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: integer
   *         description: The ID of the project
   *       - in: query
   *         name: memberEmail
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *         description: Email of the member to remove
   *     responses:
   *       200:
   *         description: Member removed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       404:
   *         description: Project or member not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Delete('/:projectId/members')
  public async removeMember(req: Request): Promise<GeneralResponseDTO<null>> {
    // Extract projectId from request parameters, memberEmail from query parameters, and userId from request
    const projectId = parseInt(req.params.projectId, 10);
    const memberEmail = req.query.memberEmail as string;
    const userId = getUserIdFromRequest(req);
    // Call the project member service to remove a member from the project
    return await this.projectMemberService.removeProjectMember(
      userId,
      projectId,
      memberEmail
    );
  }

  /**
   * @swagger
   * /projects/members/verify-invite:
   *   get:
   *     summary: Verify a project invitation token
   *     tags:
   *       - Projects
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: The invitation token to verify
   *     responses:
   *       200:
   *         description: Token verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/InviteTokenVerificationResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Get('/members/verify-invite')
  public async verifyInvitationToken(
    req: Request
  ): Promise<GeneralResponseDTO<ProjectMemberTokenVerificationDTO>> {
    // Extract token from query parameters
    const token = req.query.token as string;
    // Call the project member service to verify the invitation token
    return await this.projectMemberService.verifyInvitationToken(token);
  }
}

export default ProjectController;
