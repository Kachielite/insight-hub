import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { AuthTokenDTO } from '@dto/AuthenticationDTO';

export interface AuthenticationService {
  login(
    email: string,
    password: string
  ): Promise<GeneralResponseDTO<AuthTokenDTO>>;
  register(
    email: string,
    password: string,
    name: string
  ): Promise<GeneralResponseDTO<AuthTokenDTO>>;
  resetPasswordLink(email: string): Promise<GeneralResponseDTO<string>>;
  resetPassword(
    email: string,
    newPassword: string
  ): Promise<GeneralResponseDTO<string>>;
  refreshToken(req: Request): Promise<GeneralResponseDTO<AuthTokenDTO>>;
}
