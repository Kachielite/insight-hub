import {
  AuthenticationDTO,
  AuthTokenDTO,
  PasswordResetDTO,
  RegistrationDTO,
} from '@dto/AuthenticationDTO';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { Request } from 'express';

export interface IAuthenticationService {
  login(request: AuthenticationDTO): Promise<GeneralResponseDTO<AuthTokenDTO>>;
  register(request: RegistrationDTO): Promise<GeneralResponseDTO<AuthTokenDTO>>;
  resetPasswordLink(email: string): Promise<GeneralResponseDTO<string>>;
  resetPassword(request: PasswordResetDTO): Promise<GeneralResponseDTO<string>>;
  refreshToken(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>>;
}
