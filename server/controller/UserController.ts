import express, { Request } from 'express';
import { inject, injectable } from 'tsyringe';

import {
  BaseController,
  Controller,
  Delete,
  Get,
  Put,
} from '@common/decorators/ControllerDecorators';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { UserResponseDTO } from '@dto/UserDTO';
import UserService from '@service/implementation/UserService';
import { getUserIdFromRequest } from '@utils/GetUserID';

@injectable()
@Controller()
class UserController extends BaseController {
  constructor(
    @inject('Router') router: express.Router,
    @inject(UserService) private readonly userService: UserService
  ) {
    super(router);
  }

  /**
   * @swagger
   * /users/me:
   *   get:
   *     summary: Get current user information
   *     description: Returns the currently authenticated user's information.
   *     tags:
   *       - Users
   *     responses:
   *       200:
   *         description: Project created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDTO'
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
  @Get('/me')
  async getCurrentUser(
    req: Request
  ): Promise<GeneralResponseDTO<UserResponseDTO>> {
    const userId = getUserIdFromRequest(req);
    return await this.userService.findUserById(userId);
  }

  /**
   * @swagger
   * /users:
   *   put:
   *     summary: Update current user information
   *     description: Updates the currently authenticated user's information
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserUpdateDTO'
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDTO'
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
  @Put('/')
  async updateUser(req: Request): Promise<GeneralResponseDTO<UserResponseDTO>> {
    const userId = getUserIdFromRequest(req);
    const userUpdateData = req.body; // Assuming the body contains the necessary fields for update
    return await this.userService.updateUser(userId, userUpdateData);
  }

  /**
   * @swagger
   * /users:
   *   delete:
   *     summary: Delete current user
   *     description: Soft deletes the currently authenticated user's account
   *     tags:
   *       - Users
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: number
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: User deleted successfully
   *                 data:
   *                   type: string
   *                   example: User with ID 1 has been deleted
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
   *         description: User not found
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
  @Delete('/')
  async deleteUser(req: Request): Promise<GeneralResponseDTO<string>> {
    const userId = getUserIdFromRequest(req);
    return await this.userService.deleteUser(userId);
  }
}

export default UserController;
