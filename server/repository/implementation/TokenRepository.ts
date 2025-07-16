import { injectable } from 'tsyringe';

import prisma from '@config/db';
import { Token, TokenType } from '@prisma';
import { ITokenRepository } from '@repository/ITokenRepository';

@injectable()
class TokenRepository implements ITokenRepository {
  async findTokenByUserIdAndProjectId(
    userId: number,
    projectId: number
  ): Promise<Token | null> {
    return prisma.token.findFirst({
      where: {
        userId: userId,
        projectId: projectId,
      },
    });
  }

  async findTokenByEmailAndProjectId(
    email: string,
    projectId: number
  ): Promise<Token | null> {
    return prisma.token.findFirst({
      where: {
        email: email,
        projectId: projectId,
      },
    });
  }

  async createToken(
    token: string,
    type: TokenType,
    expiresAt: Date,
    projectId?: number,
    userId?: number,
    email?: string
  ): Promise<Token> {
    return prisma.token.create({
      data: {
        value: token,
        type: type,
        projectId: projectId,
        userId: userId,
        email: email,
        expiresAt: expiresAt,
      },
    });
  }

  async deleteToken(tokenId: number): Promise<void> {
    await prisma.token.delete({
      where: {
        id: tokenId,
      },
    });
  }

  findTokenByToken(token: string): Promise<Token | null> {
    return prisma.token.findFirst({
      where: {
        value: token,
      },
    });
  }
}

export default TokenRepository;
