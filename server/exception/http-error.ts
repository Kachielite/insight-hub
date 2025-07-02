class HttpError extends Error {
  public code: number;
  public name: string;

  constructor(code: number, message: string, name: string) {
    super(message);
    this.code = code;
    this.message = message;
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default HttpError;
