export interface EmailService {
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
}
