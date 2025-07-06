import { Role } from '@prisma';

export interface IUserRepository {
  createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: 'ADMIN' | 'MEMBER';
  }): Promise<{
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
  }>;

  findUserByEmail(email: string): Promise<{
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
  } | null>;

  findUserById(id: number): Promise<{
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
  } | null>;

  updateUser(
    id: number,
    data: {
      password?: string;
      name?: string;
      role?: 'ADMIN' | 'MEMBER';
      isActive?: boolean;
    }
  ): Promise<{
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
    isActive: boolean;
  }>;

  deleteUser(id: number): Promise<{
    id: number;
    email: string;
    password: string;
    name: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}
