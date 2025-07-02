import prisma from '@config/db';

class PasswordResetTokenRepository {
  async create(data: { userId: number; token: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return prisma.passwordResetToken.findFirst({
      where: { token },
    });
  }

  async deleteByTokenID(id: string) {
    return prisma.passwordResetToken.delete({
      where: { id },
    });
  }
}

export default PasswordResetTokenRepository;
