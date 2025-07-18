import { JwtPayload } from 'jsonwebtoken';

export interface IJwtService {
  generateToken(userId: number, type: 'access' | 'refresh'): Promise<string>;
  verifyToken(token: string): Promise<JwtPayload>;
  refreshAccessToken(refreshToken: string): Promise<string>;
}
