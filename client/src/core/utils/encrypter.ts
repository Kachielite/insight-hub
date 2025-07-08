import CryptoJS from 'crypto-js';

import { TOKEN_SECRET } from '../constants/env';

class Encrypter {
  static encryptUserToken(token: string): string | null {
    return CryptoJS.AES.encrypt(token, TOKEN_SECRET).toString();
  }

  static decodeUserToken(cipher: string): string | null {
    const bytes = CryptoJS.AES.decrypt(cipher, TOKEN_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static getUserToken(): string | null {
    const cipherText = localStorage.getItem('A');
    return cipherText ? Encrypter.decodeUserToken(cipherText) : null;
  }

  static setUserToken(token: string) {
    localStorage.setItem('A', Encrypter.encryptUserToken(token) as string);
  }

  static removeUserToken() {
    localStorage.removeItem('A');
  }
}

export default Encrypter;
