import { JwtPayload } from 'jsonwebtoken';

export interface JwtService {
  generateToken(userId: number, type: 'access' | 'refresh'): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  refreshAccessToken(refreshToken: string): Promise<string>;
}
