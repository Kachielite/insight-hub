import { Either } from 'fp-ts/Either';

import { Failure } from '@/core/error/failure.ts';
import User from '@/features/User/domain/entity/user.ts';

export interface UserRepository {
  getUser(): Promise<Either<Failure, User>>;
}
