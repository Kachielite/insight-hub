import {
  BaseController,
  Controller,
  Get,
} from '@common/decorators/ControllerDecorators';
import express from 'express';
import { inject, injectable } from 'tsyringe';

@injectable()
@Controller()
class HealthCheckController extends BaseController {
  constructor(@inject('Router') router: express.Router) {
    super(router);
  }

  /**
   * @swagger
   * /health-check:
   *   get:
   *     tags:
   *       - Health Check
   *     summary: Health Check
   *     responses:
   *       200:
   *         description: Server is healthy and running
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *               example: 'Server is healthy and running'
   */
  @Get('/')
  async healthCheck(): Promise<string> {
    return 'Server is healthy and running';
  }
}

export default HealthCheckController;
