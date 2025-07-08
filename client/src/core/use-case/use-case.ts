import type { Failure } from '../error/failure.ts';
import type { Either } from 'fp-ts/Either';

export abstract class UseCase<T, P> {
  abstract execute(params: P): Promise<Either<Failure, T>>;
}

export class NoParams {}
