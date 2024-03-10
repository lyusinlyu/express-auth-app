import { Service } from 'typedi';
import sgMail from '@sendgrid/mail';
import config from '../../config';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import logger from '../../lib/logger';

@Service()
export class MailService {
  public async sendMail(
    recipientEmail: string,
    verificationCode: string,
    subject: string,
    id: string,
  ): Promise<boolean | undefined> {
    sgMail.setApiKey(config.sendgridAPIKey);
    const msg = {
      to: recipientEmail,
      from: config.fromEmail,
      subject,
      text: `Your verification code is ${verificationCode}, Id is ${id}`,
    };
    try {
      const [response] = await sgMail.send(msg);
      if (response.statusCode === 202) {
        logger.info('Email sent successfully');
        return true;
      }
    } catch (error) {
      console.error('Error sending email', error);
      return false;
    }
  }
}
