import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/userService';
import ms from 'ms';
const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const verifyResult = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(verifyResult);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const loginResult = await userService.login(req.body);

    res.cookie('accessToken', loginResult.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days'),
    });

    res.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days'),
    });

    res.status(StatusCodes.OK).json(loginResult);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createNew,
  verifyAccount,
  login,
};
