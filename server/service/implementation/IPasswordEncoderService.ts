import bcrypt from 'bcrypt';
import { PasswordEncoderService } from '@service/PasswordEncoderService';
import { injectable } from 'tsyringe';

@injectable()
class IPasswordEncoderService implements PasswordEncoderService {
  async hashPassword(password: string): Promise<string> {
    // Use a library like bcrypt to hash the password
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    // Use a library like bcrypt to compare the passwords
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default IPasswordEncoderService;
