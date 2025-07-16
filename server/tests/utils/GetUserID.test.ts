import { Request } from 'express';

import { NotAuthenticatedException } from '@/exception';
import { getUserIdFromRequest } from '@/utils/GetUserID';

describe('getUserIdFromRequest', () => {
  it('should return user id as a number if user is present in request', () => {
    const req = { user: { id: '42' } } as unknown as Request;
    expect(getUserIdFromRequest(req)).toBe(42);
  });

  it('should throw NotAuthenticatedException if user is not present in request', () => {
    const req = {} as Request;
    expect(() => getUserIdFromRequest(req)).toThrow(NotAuthenticatedException);
  });
});
