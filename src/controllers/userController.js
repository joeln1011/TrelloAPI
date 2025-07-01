import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/userService';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { MailerSendProvider } from '~/providers/MailerSendProvider';
const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    // Send an email to verify the email address
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${createdUser.email}&token=${createdUser.verifyToken}`;
    const to = createdUser.email;
    const toName = createdUser.username;
    const subject = 'Please verify your email address before using Trello';
    const html = `
        <h1>Welcome to Trello!</h1>
        <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>`;

    // Send the email using ResendProvider
    const mailersendEmailResponse = await MailerSendProvider.sendEmail({
      to,
      toName,
      subject,
      html,
    });
    console.log('Email sent successfully:', mailersendEmailResponse);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createNew,
};
