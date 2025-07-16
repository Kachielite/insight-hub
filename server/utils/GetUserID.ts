import { Request } from 'express';

import { NotAuthenticatedException } from '@/exception';

export function getUserIdFromRequest(req: Request): number {
  if (req.user) {
    return Number(req.user.id);
  } else {
    throw new NotAuthenticatedException('User ID not found in request');
  }
}
