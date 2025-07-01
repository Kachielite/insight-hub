import { Role } from '@prisma';

export class UserCreationDTO {
  public username: string;
  public password: string;
  public email: string;
  public role: Role;

  constructor(
    username: string,
    password: string,
    email: string,
    role: Role = Role.MEMBER
  ) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.role = role;
  }
}

export class UserUpdateDTO {
  public id: number;
  public username?: string;
  public email?: string;
  public role?: Role;

  constructor(id: number, username?: string, email?: string, role?: Role) {
    this.id = id;
    this.username = username;
    this.email = email;
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
