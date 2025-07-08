import { NextFunction, Request, Response } from 'express';

import { BadRequestException } from '@/exception';

class RequestValidationMiddleware {
  public static validate(schema: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new BadRequestException(
          `${error.details[0].message.replace(/['"]+/g, '')}`
        );
      }
      next();
    };
  }
}

export default RequestValidationMiddleware;
