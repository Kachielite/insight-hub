import { left } from 'fp-ts/Either';

import { Failure } from '@/core/error/failure.ts';
import { ServerException } from '@/core/error/server.ts';

const extractErrorRepository = (error: any, handlerName: string) => {
  console.error(handlerName, error);
  const errorMessage =
    error instanceof ServerException
      ? error.message
      : 'An unknown error occurred';
  return left(new Failure(errorMessage));
};

export default extractErrorRepository;
