import InviteVerification from '@/features/Project/domain/entity/invite-verification.ts';

class InviteVerificationModel extends InviteVerification {
  constructor(
    public isVerified: boolean,
    public isUser: boolean
  ) {
    super(isVerified, isUser);
  }

  static fromJSON(entity: InviteVerification): InviteVerificationModel {
    return new InviteVerificationModel(entity.isVerified, entity.isUser);
  }
}

export default InviteVerificationModel;
