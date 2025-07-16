import { injectable } from 'tsyringe';

import prisma from '@config/db';
import { Role } from '@prisma';
import { IUserRepository } from '@repository/IUserRepositroy';

@injectable()
class UserRepository implements IUserRepository {
  constructor() {}

  public async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: Role;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role ?? Role.MEMBER,
      },
    });
  }

  public async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        Project: true,
      },
    });
  }

  public async updateUser(
    id: number,
    data: { password?: string; name?: string; role?: Role; isActive?: boolean }
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        password: data.password,
        name: data.name,
        role: data.role,
        isActive: data.isActive ?? true,
      },
    });
  }

  public async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export default UserRepository;
