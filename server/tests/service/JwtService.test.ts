import JwtService from '@service/implementation/JwtService';
import UserRepository from '@repository/implementation/UserRepository';

describe('JwtService', () => {
  let jwtService: JwtService;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepositoryMock = {
      findUserById: jest.fn().mockResolvedValue({ id: 1, role: 'USER' }),
      // ...other methods can be mocked as needed
    } as any;
    jwtService = new JwtService(userRepositoryMock);
  });

  it('should generate and verify a token', async () => {
    const token = await jwtService.generateToken(1, 'access');
    const decoded = await jwtService.verifyToken(token);
    expect(decoded.userId).toBe(1);
  });

  it('should throw on invalid token', async () => {
    await expect(jwtService.verifyToken('invalid.token')).rejects.toThrow();
  });
});
