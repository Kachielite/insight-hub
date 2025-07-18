import { Token, TokenType } from '@prisma';

export interface ITokenRepository {
  createToken(
    token: string,
    type: TokenType,
    expiresAt: Date,
    projectId?: number,
    userId?: number,
    email?: string
  ): Promise<Token>;
  findTokenByToken(token: string): Promise<Token | null>;
  findTokenByUserIdAndProjectId(
    userId: number,
    projectId: number
  ): Promise<Token | null>;
  findTokenByEmailAndProjectId(
    email: string,
    projectId: number
  ): Promise<Token | null>;
  deleteToken(tokenId: number): Promise<void>;
}
