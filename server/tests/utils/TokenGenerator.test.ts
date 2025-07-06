import TokenGenerator from '../../utils/TokenGenerator';

describe('TokenGenerator', () => {
  it('should generate a token of the specified length', () => {
    const length = 32;
    const token = TokenGenerator.generateToken();
    expect(token).toHaveLength(length);
    expect(typeof token).toBe('string');
  });

  it('should generate unique tokens', () => {
    const token1 = TokenGenerator.generateToken();
    const token2 = TokenGenerator.generateToken();
    expect(token1).not.toBe(token2);
  });
});
