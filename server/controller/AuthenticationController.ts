import express, { Request } from 'express';
import { inject, injectable } from 'tsyringe';

import {
  BaseController,
  Controller,
  Get,
  Post,
} from '@common/decorators/ControllerDecorators';
import { AuthTokenDTO } from '@dto/AuthenticationDTO';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { AuthenticationValidationSchema } from '@dto/RequestValidationSchema';
import AuthenticationService from '@service/implementation/AuthenticationService';

@injectable()
@Controller()
class AuthenticationController extends BaseController {
  constructor(
    @inject('Router') router: express.Router,
    @inject(AuthenticationService)
    private readonly authenticationService: AuthenticationService
  ) {
    super(router);
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login a user
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AuthenticationDTO'
   *     responses:
   *       200:
   *         description: User logged in successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthenticationSuccessResponseDTO'
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
   *
   */
  @Post('/login', {
    validate: AuthenticationValidationSchema.loginSchema,
  })
  async login(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    return await this.authenticationService.login(req.body);
  }

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegistrationDTO'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthenticationSuccessResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       409:
   *         description: Conflict
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
  @Post('/register', {
    validate: AuthenticationValidationSchema.registrationSchema,
    statusCode: 201,
  })
  async register(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    return await this.authenticationService.register(req.body);
  }

  /**
   * @swagger
   * /auth/reset-password-link:
   *   get:
   *     summary: Request a password reset link
   *     tags:
   *       - Authentication
   *     parameters:
   *       - in: query
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *           description: The email address of the user requesting the reset link
   *     responses:
   *       200:
   *         description: Password reset link sent successfully
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
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Get('/reset-password-link')
  async resetPasswordLink(req: Request): Promise<GeneralResponseDTO<string>> {
    const email = req.query.email as string;
    return await this.authenticationService.resetPasswordLink(email);
  }

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Reset a user's password
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PasswordResetDTO'
   *     responses:
   *       200:
   *         description: Password reset successfully
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
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   */
  @Post('/reset-password', {
    validate: AuthenticationValidationSchema.passwordResetSchema,
  })
  async resetPassword(req: Request): Promise<GeneralResponseDTO<string>> {
    return await this.authenticationService.resetPassword(req.body);
  }

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     summary: Refresh a user's access token
   *     tags:
   *       - Authentication
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Access token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthenticationSuccessResponseDTO'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDTO'
   *       403:
   *         description: Not authorized
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
  @Post('/refresh-token')
  async refreshToken(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    return await this.authenticationService.refreshToken(req);
  }
}

export default AuthenticationController;
