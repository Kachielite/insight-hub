export interface IPasswordEncoderService {
  hashPassword(password: string): Promise<string>;
  comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}
