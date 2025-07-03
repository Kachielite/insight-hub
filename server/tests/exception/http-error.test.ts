import HttpError from '@exception/http-error';

describe('HttpError', () => {
  it('should set code, message, and name', () => {
    const err = new HttpError(404, 'Not Found', 'NotFoundError');
    expect(err.code).toBe(404);
    expect(err.message).toBe('Not Found');
    expect(err.name).toBe('NotFoundError');
  });
});
