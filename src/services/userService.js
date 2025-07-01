import ApiError from '~/utils/ApiError';
import bcrypt from 'bcryptjs';
import { userModel } from '~/models/userModel';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { pickUser } from '~/utils/formatters';

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

    // Return value for controller
    return pickUser(getNewUser); // Format the user data before return
  } catch (error) {
    throw error;
  }
};

export const userService = {
  createNew,
};
