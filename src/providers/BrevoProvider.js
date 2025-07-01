const brevo = require('@getbrevo/brevo');
import { env } from '~/config/environment';

let apiInstance = new brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  // Create a new SendSmtpEmail object
  let sendSmtpEmail = new brevo.SendSmtpEmail();

  // Set the sender's email and name
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  };

  // Set the recipient's email
  sendSmtpEmail.to = [{ email: recipientEmail }];

  // Set the subject of the email
  sendSmtpEmail.subject = customSubject;

  // Set the HTML content of the email
  sendSmtpEmail.htmlContent = customHtmlContent;

  try {
    return await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    // Log the detailed error response from Brevo
    console.error(
      'Brevo sendTransacEmail error:',
      error?.response?.body || error
    );
    throw error;
  }
};

export const BrevoProvider = { sendEmail };
