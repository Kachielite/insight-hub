import type { Failure } from '@/core/error/failure.ts';
import type {
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthRequestResetPasswordSchema,
  AuthResetSchema,
} from '@/core/validation/auth.ts';
import type Auth from '@/features/Authentication/domain/entity/auth.ts';

import type { Either } from 'fp-ts/Either';

export interface AuthRepository {
  login(data: AuthLoginSchema): Promise<Either<Failure, Auth>>;
  register(data: AuthRegisterSchema): Promise<Either<Failure, Auth>>;
  requestResetPassword(
    data: AuthRequestResetPasswordSchema
  ): Promise<Either<Failure, string>>;
  resetPassword(data: AuthResetSchema): Promise<Either<Failure, string>>;
}
