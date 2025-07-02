import HttpError from '@exception/http-error';

export class BadRequestException extends HttpError {
  constructor(message: string) {
    super(400, message, 'Bad Request');
  }
}

export class NotAuthenticatedException extends HttpError {
  constructor(message: string) {
    super(401, message, 'Not Authenticated');
  }
}

export class NotAuthorizedException extends HttpError {
  constructor(message: string) {
    super(403, message, 'Not Authorized');
  }
}

export class ResourceNotFoundException extends HttpError {
  constructor(message: string) {
    super(404, message, 'Resource Not Found');
  }
}

export class MethodNotAllowedException extends HttpError {
  constructor(message: string) {
    super(405, message, 'Method Not Allowed');
  }
}

export class ConflictException extends HttpError {
  constructor(message: string) {
    super(409, message, 'Conflict');
  }
}

export class InternalServerException extends HttpError {
  constructor(message: string) {
    super(500, message, 'Internal Server Error');
  }
}
