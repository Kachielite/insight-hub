import bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';

import { IPasswordEncoderService } from '@service/IPasswordEncoderService';

@injectable()
class PasswordEncoderService implements IPasswordEncoderService {
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

export default PasswordEncoderService;
