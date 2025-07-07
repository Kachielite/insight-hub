import type { Either } from 'fp-ts/Either';
import type { Failure } from '../error/failure.ts';

export abstract class UseCase<T, P> {
  abstract execute(params: P): Promise<Either<Failure, T>>;
}

export class NoParams {}
