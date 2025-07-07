import Auth from '@/features/Authentication/domain/entity/auth.ts';

class AuthEntity extends Auth {
  constructor(accessToken: string, refreshToken: string) {
    super(accessToken, refreshToken);
  }

  static fromJson(auth: Auth): AuthEntity {
    return new AuthEntity(auth.accessToken, auth.refreshToken);
  }
}

export default AuthEntity;
