import express, { Request } from 'express';
import { inject, injectable } from 'tsyringe';
import AuthenticationService from '@service/implementation/AuthenticationService';
import { AuthenticationValidationSchema } from '@dto/RequestValidationSchema';
import {
  BaseController,
  Controller,
  Get,
  Post,
} from '@common/decorators/ControllerDecorators';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { AuthTokenDTO } from '@dto/AuthenticationDTO';

@injectable()
@Controller()
class AuthenticationController extends BaseController {
  constructor(
    @inject('Router') router: express.Router,
    @inject(AuthenticationService)
    private authenticationService: AuthenticationService
  ) {
    super(router);
  }

  @Post('/login', {
    validate: AuthenticationValidationSchema.loginSchema,
  })
  async login(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    return await this.authenticationService.login(req.body);
  }

  @Post('/register', {
    validate: AuthenticationValidationSchema.registrationSchema,
    statusCode: 201,
  })
  async register(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>> {
    return await this.authenticationService.register(req.body);
  }

  @Get('/reset-password-link')
  async resetPasswordLink(req: Request): Promise<GeneralResponseDTO<string>> {
    const email = req.params.email;
    return await this.authenticationService.resetPasswordLink(email);
  }

  @Post('/reset-password', {
    validate: AuthenticationValidationSchema.passwordResetSchema,
  })
  async resetPassword(req: Request): Promise<GeneralResponseDTO<string>> {
    return await this.authenticationService.resetPassword(req.body);
  }
}

export default AuthenticationController;
