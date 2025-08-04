import CryptoJS from 'crypto-js';

import { TOKEN_SECRET } from '../constants/env';

class Encrypter {
  static encryptUserToken(token: string): void {
    if (!token || token.trim() === '') {
      console.error('Encrypter: Token is empty or null');
      return;
    }
    try {
      const cipherText = CryptoJS.AES.encrypt(token, TOKEN_SECRET).toString();
      localStorage.setItem('A', cipherText);
    } catch (error) {
      console.error('Encrypter: Error encrypting token:', error);
      throw error;
    }
  }

  static decodeUserToken(cipher: string): string | null {
    try {
      if (!cipher || cipher.trim() === '') {
        console.error('Encrypter: Cipher text is empty or null');
        return null;
      }

      const bytes = CryptoJS.AES.decrypt(cipher, TOKEN_SECRET);
      const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedToken || decryptedToken.trim() === '') {
        console.error(
          'Encrypter: Decrypted token is empty - possible key mismatch'
        );
        console.error(
          'Encrypter: Raw decrypted bytes as hex:',
          bytes.toString(CryptoJS.enc.Hex)
        );
        return null;
      }
      return decryptedToken;
    } catch (error) {
      console.error('Encrypter: Error decoding token:', error);
      return null;
    }
  }

  static async getUserToken(): Promise<string | null> {
    const cipherText = localStorage.getItem('A');

    if (!cipherText) {
      console.log('Encrypter: No cipher text found in localStorage');
      return null;
    }

    return Encrypter.decodeUserToken(cipherText);
  }
  static clearUserToken(): void {
    localStorage.removeItem('A');
    console.log('Encrypter: Stored token cleared');
  }
}

export default Encrypter;
