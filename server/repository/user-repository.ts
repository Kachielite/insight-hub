import { Role } from '@prisma';
import prisma from '@controller/db';

class UserRepository {
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
        role: data.role || Role.MEMBER,
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
    });
  }

  public async findAllUsers(page: number = 1, size: number = 10) {
    const skip = (page - 1) * size;
    const users = await prisma.user.findMany({
      skip: skip,
      take: size,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const count = await prisma.user.count({});

    return {
      users,
      total: count,
      page,
      size,
    };
  }

  public async searchUsers(query: string, page: number = 1, size: number = 10) {
    const skip = (page - 1) * size;
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip: skip,
      take: size,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const count = await prisma.user.count({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    return {
      users,
      total: count,
      page,
      size,
    };
  }

  public async updateUser(
    id: number,
    data: { email?: string; password?: string; name?: string; role?: Role }
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
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
