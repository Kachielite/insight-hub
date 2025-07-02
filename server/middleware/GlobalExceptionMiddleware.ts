import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { injectable } from 'tsyringe';
import HttpError from '@exception/http-error';
import { Constants } from '@config/constants';
import ErrorResponse from '@dto/ErrorResponseDTO';
import logger from '@utils/logger';

@injectable()
class GlobalExceptionMiddleware {
  public resourceNotFoundHandler: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const error = new HttpError(
      404,
      'Resource not found',
      'Resource Not Found'
    );
    next(error);
  };

  public allExceptionHandler: ErrorRequestHandler = (
    error: HttpError,
    req: Request,
    res: Response
  ) => {
    const environment = Constants.NODE_ENV;
    const statusCode = error.code || 500;
    const message = error.message;
    const name = error.name;
    const stack = environment === 'development' ? error.stack : undefined;

    logger.error(
      `${name} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );

    const errorResponse = new ErrorResponse(statusCode, name, message, stack);

    res.status(statusCode).json(errorResponse);
  };
}

export default GlobalExceptionMiddleware;
