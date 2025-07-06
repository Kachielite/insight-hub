import { Role } from '@prisma';

export class UserUpdateDTO {
  public id: number;
  public currentPassword?: string;
  public newPassword?: string;
  public name?: string;
  public role?: Role;

  constructor(
    id: number,
    currentPassword?: string,
    newPassword?: string,
    name?: string,
    role?: Role
  ) {
    this.id = id;
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
    this.name = name;
    this.role = role;
  }
}

export class UserResponseDTO {
  public id: number;
  public username: string;
  public email: string;
  public role: Role;
  public createdAt: Date;

  constructor(
    id: number,
    username: string,
    email: string,
    role: Role,
    createdAt: Date
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt;
  }
}
