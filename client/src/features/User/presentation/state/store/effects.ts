import { fold } from 'fp-ts/Either';

import type { Failure } from '@/core/error/failure.ts';
import User from '@/features/User/domain/entity/user.ts';
import { getUserUseCases } from '@/init-dependencies/user-di.ts';

const getCurrentUserUseCase = () => getUserUseCases().getUserUseCase;

export const fetchUserEffect = async () => {
  const response = await getCurrentUserUseCase().execute({});

  return fold<Failure, User, User>(
    (failure) => {
      console.error('fetchUserEffect:', failure);
      throw new Error(failure.message);
    },
    (user) => user
  )(response);
};
