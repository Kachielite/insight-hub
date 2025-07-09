import * as nodemailer from 'nodemailer';
import { injectable } from 'tsyringe';

import { Constants } from '@config/constants';

@injectable()
class EmailConfig {
  private readonly NODE_MAIL_USER = Constants.NODE_MAIL_USER as string;
  private readonly NODE_MAIL_PASS = Constants.NODE_MAIL_PASS as string;

  public async getTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.NODE_MAIL_USER,
        pass: this.NODE_MAIL_PASS,
      },
    });
  }
}

export default EmailConfig;
