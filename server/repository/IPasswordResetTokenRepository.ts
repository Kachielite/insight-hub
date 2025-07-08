export interface IPasswordResetTokenRepository {
  create(data: { userId: number; token: string; expiresAt: Date }): Promise<{
    id: string;
    token: string;
    userId: number;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
  }>;
  findByUserId(userId: number): Promise<{
    id: string;
    token: string;
    userId: number;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
  }>;
  findByToken(token: string): Promise<{
    id: string;
    token: string;
    userId: number;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
  }>;
  deleteByTokenID(id: string): Promise<{
    id: string;
    token: string;
    userId: number;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
  }>;
}
