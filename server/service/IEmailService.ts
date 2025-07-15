export interface IEmailService {
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
  sendEmailProjectInvite(
    email: string,
    inviterName: string,
    projectName: string,
    inviteLink: string
  ): Promise<void>;
}
