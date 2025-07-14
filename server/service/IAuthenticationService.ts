import { Request } from 'express';

import {
  AuthenticationDTO,
  AuthTokenDTO,
  PasswordResetDTO,
  RegistrationDTO,
} from '@dto/AuthenticationDTO';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';

export interface IAuthenticationService {
  login(request: AuthenticationDTO): Promise<GeneralResponseDTO<AuthTokenDTO>>;
  register(request: RegistrationDTO): Promise<GeneralResponseDTO<AuthTokenDTO>>;
  resetPasswordLink(email: string): Promise<GeneralResponseDTO<string>>;
  resetPassword(request: PasswordResetDTO): Promise<GeneralResponseDTO<string>>;
  refreshToken(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>>;
}
