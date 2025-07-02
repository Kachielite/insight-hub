export interface IEmailService {
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
}
