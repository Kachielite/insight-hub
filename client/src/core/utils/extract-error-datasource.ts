import { ServerException } from '@/core/error/server.ts';

const extractErrorDatasource = (error: unknown, handlerName: string): never => {
  if (error instanceof ServerException) {
    console.error(`${handlerName}: ${error.message}`);
    throw error; // Re-throw the original ServerException
  }

  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred';
  console.error(`${handlerName}: ${errorMessage}`);
  throw new ServerException(errorMessage);
};

export default extractErrorDatasource;
