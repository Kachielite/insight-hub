// Set up environment variables before any imports
import UserRepository from '@repository/implementation/UserRepository';
import JwtService from '@service/implementation/JwtService';

process.env.JWT_SECRET = 'test-secret-key-for-jwt-tests';
process.env.JWT_ACCESS_TOKEN_EXPIRY = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRY = '7d';

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

  it('should throw an error if the user does not exist', async () => {
    userRepositoryMock.findUserById.mockResolvedValue(null);
    await expect(jwtService.generateToken(1, 'access')).rejects.toThrow();
  });

  it('should throw on invalid token', async () => {
    await expect(jwtService.verifyToken('invalid.token')).rejects.toThrow();
  });

  it('should refresh an access token', async () => {
    const refreshToken = await jwtService.generateToken(1, 'refresh');
    const accessToken = await jwtService.refreshAccessToken(refreshToken);
    const decoded = await jwtService.verifyToken(accessToken);
    expect(decoded.userId).toBe(1);
  });

  it('should throw on invalid refresh token', async () => {
    await expect(
      jwtService.refreshAccessToken('invalid.token')
    ).rejects.toThrow();
  });
});
