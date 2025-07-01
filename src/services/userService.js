import ApiError from '~/utils/ApiError';
import bcrypt from 'bcryptjs';
import { userModel } from '~/models/userModel';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { pickUser } from '~/utils/formatters';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { MailerSendTemplateProvider } from '~/providers/MailerSendTemplateProvider';
import { env } from '~/config/environment';

const createNew = async (reqBody) => {
  try {
    // Check if the email already exists
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!');
    }
    // Create data to save in Database
    // Extract the name from the email address
    const nameFromEmail = reqBody.email.split('@')[0];
    const newUser = {
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8), // Hash the password
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4(), // Generate a unique token for email verification
    };

    // Create a new user in the database
    const createdUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(createdUser.insertedId);
    console.log('Created user:', getNewUser);
    console.log('getNewUser:', getNewUser);
    // Send an email to verify the email address
    const link = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;

    const to = getNewUser.email;
    const toName = getNewUser.username;
    const subject = 'Created a new account on Trello - {{ name }}';
    const verificationLink = `<a href="${link}">Verify Email</a>`;
    const personalizationData = {
      email: to,
      data: {
        name: toName,
        verificationLink: verificationLink,
      },
    };
    // Send the email using ResendProvider
    const mailerSendTemplateProvider =
      await MailerSendTemplateProvider.sendEmail({
        to,
        toName,
        subject,
        tempplateId: env.REGISTER_TEMPLATE_ID,
        personalizationData,
      });
    console.log('Email sent successfully:', mailerSendTemplateProvider);
    // Return value for controller
    return pickUser(getNewUser); // Format the user data before return
  } catch (error) {
    throw error;
  }
};

export const userService = {
  createNew,
};
