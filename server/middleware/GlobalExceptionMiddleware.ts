import { NextFunction, Request, RequestHandler, Response } from 'express';
import { injectable } from 'tsyringe';

import { Constants } from '@config/constants';
import ErrorResponseDTO from '@dto/ErrorResponseDTO';
import HttpError from '@exception/http-error';
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

  public allExceptionHandler = (
    error: HttpError,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const environment = Constants.NODE_ENV;
    const statusCode = error.code ?? 500;
    const message = error.message;
    const name = error.name;
    const stack = environment === 'development' ? error.stack : undefined;

    // Log the error
    logger.error(
      `${name} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${statusCode}`
    );
    if (stack) {
      logger.error(stack);
    }

    // Send JSON response
    const errorResponse = new ErrorResponseDTO(
      statusCode,
      name,
      message,
      stack
    );

    res.status(statusCode).json(errorResponse);
  };
}

export default GlobalExceptionMiddleware;
