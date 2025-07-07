import { randomBytes } from 'crypto';

class TokenGenerator {
  private static readonly characters: string =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  private static readonly tokenLength: number = 32;

  public static generateToken(): string {
    let token = '';
    for (let i = 0; i < this.tokenLength; i++) {
      const randomIndex = randomBytes(1)[0] % this.characters.length;
      token += this.characters[randomIndex];
    }
    return token;
  }
}

export default TokenGenerator;
