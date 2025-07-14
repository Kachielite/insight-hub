import Auth from '@/features/Authentication/domain/entity/auth.ts';

class AuthModel extends Auth {
  constructor(accessToken: string, refreshToken: string) {
    super(accessToken, refreshToken);
  }

  static fromJson(auth: Auth): AuthModel {
    return new AuthModel(auth.accessToken, auth.refreshToken);
  }
}

export default AuthModel;
