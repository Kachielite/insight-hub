import PasswordEncoderService from '@service/implementation/PasswordEncoderService';

describe('PasswordEncoderService', () => {
  let passwordEncoderService: PasswordEncoderService;

  beforeEach(() => {
    passwordEncoderService = new PasswordEncoderService();
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      const password = 'password123';
      const hashedPassword =
        await passwordEncoderService.hashPassword(password);
      expect(hashedPassword).not.toBe(password);
    });

    it('should compare passwords', async () => {
      const password = 'password123';
      const hashedPassword =
        await passwordEncoderService.hashPassword(password);
      const result = await passwordEncoderService.comparePasswords(
        password,
        hashedPassword
      );
      expect(result).toBe(true);
    });

    it('should not compare passwords', async () => {
      const password = 'password123';
      const hashedPassword =
        await passwordEncoderService.hashPassword(password);
      const result = await passwordEncoderService.comparePasswords(
        'wrongPassword',
        hashedPassword
      );
      expect(result).toBe(false);
    });
  });
});
