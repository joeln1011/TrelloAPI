import { env } from '~/config/environment';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const MAILER_SEND_API_KEY = env.MAILER_SEND_API_KEY;
const ADMIN_SENDER_EMAIL = env.ADMIN_SENDER_EMAIL;
const ADMIN_SENDER_NAME = env.ADMIN_SENDER_NAME;

const mailerSendInstance = new MailerSend({
  apiKey: MAILER_SEND_API_KEY,
});

const sendFrom = new Sender(ADMIN_SENDER_EMAIL, ADMIN_SENDER_NAME);
const sendEmail = async ({
  to,
  toName,
  subject,
  tempplateId,
  personalizationData,
}) => {
  try {
    // Create a new Recipient object
    const recipient = [new Recipient(to, toName)];

    // Create a new EmailParams object
    const emailParams = new EmailParams()
      .setFrom(sendFrom)
      .setTo(recipient)
      .setReplyTo(sendFrom)
      .setSubject(subject)
      .setTemplateId(tempplateId)
      .setPersonalization({
        personalizationData,
      });

    const data = await mailerSendInstance.email.send(emailParams);
    return data;
  } catch (error) {
    console.error('MailerSend sendEmail error:', error);
    throw error;
  }
};

export const MailerSendTemplateProvider = { sendEmail };
