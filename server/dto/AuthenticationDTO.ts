export class AuthTokenDTO {
  accessToken: string;
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

export class AuthenticationDTO {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class RegistrationDTO {
  email: string;
  password: string;
  name: string;

  constructor(email: string, password: string, name: string) {
    this.email = email;
    this.password = password;
    this.name = name;
  }
}

export class PasswordResetDTO {
  email: string;
  newPassword: string;
  resetToken: string;

  constructor(email: string, newPassword: string, resetToken: string) {
    this.email = email;
    this.newPassword = newPassword;
    this.resetToken = resetToken;
  }
}
