import { NotAuthenticatedException, NotAuthorizedException } from '@/exception';

import AuthenticationMiddleware from '../../middleware/AuthenticationMiddleware';

const mockJwtService = {
  verifyToken: jest.fn(),
};
const mockUserRepository = {
  findUserById: jest.fn(),
};

const getMockReqResNext = (path = '/api/protected', token?: string) => {
  const req: any = {
    path,
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
  const res: any = {};
  const next = jest.fn();
  return { req, res, next };
};

describe('AuthenticationMiddleware', () => {
  let middleware: AuthenticationMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = new AuthenticationMiddleware(
      mockJwtService as any,
      mockUserRepository as any
    );
  });

  it('should skip authentication for excluded routes', async () => {
    const { req, res, next } = getMockReqResNext('/api/health-check');
    await middleware.authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should skip authentication for excluded prefixes', async () => {
    const { req, res, next } = getMockReqResNext('/api-docs/some');
    await middleware.authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should throw NotAuthorizedException if no token', async () => {
    const { req, res, next } = getMockReqResNext();
    await expect(middleware.authenticate(req, res, next)).rejects.toThrow(
      NotAuthorizedException
    );
  });

  it('should throw NotAuthorizedException for invalid/expired token', async () => {
    mockJwtService.verifyToken.mockRejectedValue(
      new NotAuthorizedException('Invalid or expired token')
    );
    const { req, res, next } = getMockReqResNext('/api/protected', 'badtoken');
    await middleware.authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(NotAuthorizedException));
  });

  it('should throw NotAuthenticatedException if user not found', async () => {
    mockJwtService.verifyToken.mockResolvedValue({ userId: '123' });
    mockUserRepository.findUserById.mockResolvedValue(null);
    const { req, res, next } = getMockReqResNext(
      '/api/protected',
      'validtoken'
    );
    await middleware.authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(NotAuthenticatedException));
  });

  it('should attach user to req and call next for valid token and user', async () => {
    const user = { id: '123', name: 'Test' };
    mockJwtService.verifyToken.mockResolvedValue({ userId: '123' });
    mockUserRepository.findUserById.mockResolvedValue(user);
    const { req, res, next } = getMockReqResNext(
      '/api/protected',
      'validtoken'
    );
    await middleware.authenticate(req, res, next);
    expect(req.user).toEqual({ userId: '123' });
    expect(next).toHaveBeenCalledWith();
  });
});
