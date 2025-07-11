import ApiError from '~/utils/ApiError';
import bcrypt from 'bcryptjs';
import { userModel } from '~/models/userModel';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { pickUser } from '~/utils/formatters';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { MailerSendTemplateProvider } from '~/providers/MailerSendTemplateProvider';
import { env } from '~/config/environment';
import { JwtProvider } from '~/providers/JwtProvider';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';

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

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!');
    }
    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your Account is already active!'
      );
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Invalid verification token!'
      );
    }
    // Update the user data to set isActive to true and clear the verifyToken
    const updateData = {
      isActive: true,
      verifyToken: null, // Clear the verification token after successful verification
    };

    // Update the user in the database
    const updatedUser = await userModel.update(existUser._id, updateData);
    // Format the user data before return controller
    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!');
    }
    if (!existUser.isActive) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your Account is not active yet!'
      );
    }
    if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid password!');
    }

    // Generate access and refresh tokens
    const userInfo = { _id: existUser._id, email: existUser.email };

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_PRIVATE_KEY,
      env.ACCESS_TOKEN_EXPIRATION
    );
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_PRIVATE_KEY,
      env.REFRESH_TOKEN_EXPIRATION
    );
    return { accessToken, refreshToken, ...pickUser(existUser) }; // Format the user data before return
  } catch (error) {
    throw error;
  }
};
const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_PRIVATE_KEY
    );
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email,
    };
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_PRIVATE_KEY,
      env.ACCESS_TOKEN_EXPIRATION
    );
    return { accessToken };
  } catch (error) {
    throw error;
  }
};

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query User and checking if the user exists
    const existUser = await userModel.findOneById(userId);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!');
    }
    if (!existUser.isActive) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your Account is not active yet!'
      );
    }
    // Check if the email already exists
    let updatedUser = {};

    if (reqBody.current_password && reqBody.new_password) {
      // Check if the current password is correct
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          'Your Current Password is incorrect!'
        );
      }
      // Hash the new password
      updatedUser = await userModel.update(existUser._id, {
        password: bcrypt.hashSync(reqBody.new_password, 8),
      });
    } else if (userAvatarFile) {
      // Upload the avatar image to Cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(
        userAvatarFile.buffer,
        'users'
      );
      // Update avatar URL (secure_url) to database
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url,
      });
    } else {
      updatedUser = await userModel.update(existUser._id, reqBody);
    }
    return pickUser(updatedUser); // Format the user data before return
  } catch (error) {
    throw error;
  }
};
export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update,
};
