import ProjectDTO from '@dto/ProjectDTO';
import { Role } from '@prisma';

export class UserUpdateDTO {
  public currentPassword?: string;
  public newPassword?: string;
  public name?: string;
  public role?: Role;

  constructor(
    currentPassword?: string,
    newPassword?: string,
    name?: string,
    role?: Role
  ) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
    this.name = name;
    this.role = role;
  }
}

export class UserResponseDTO {
  public id: number;
  public name: string;
  public email: string;
  public role: Role;
  public createdAt: Date;
  public projects?: ProjectDTO[];

  constructor(
    id: number,
    name: string,
    email: string,
    role: Role,
    createdAt: Date,
    projects?: ProjectDTO[]
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt;
    this.projects = projects;
  }
}
