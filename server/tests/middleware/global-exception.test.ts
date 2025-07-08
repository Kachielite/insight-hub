import GlobalExceptionMiddleware from '@middleware/GlobalExceptionMiddleware';
import { NextFunction, Response } from 'express';

describe('GlobalExceptionMiddleware', () => {
  it('should call res.status and res.json when an error occurs', () => {
    const err = new Error('Test error') as any;
    err.code = undefined; // Simulate no code property
    const req = { originalUrl: '/test', method: 'GET', ip: '127.0.0.1' } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    const middleware = new GlobalExceptionMiddleware();
    middleware.allExceptionHandler(err, req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Test error',
      error: 'Error',
    });
  });
});
