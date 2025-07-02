class ErrorResponse {
  public error: string;
  public message: string;
  public statusCode: number;
  public stack?: string;

  constructor(
    statusCode: number,
    error: string,
    message: string,
    stack?: string
  ) {
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
    if (stack) {
      this.stack = stack;
    }
  }
}

export default ErrorResponse;
