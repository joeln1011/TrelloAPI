import { StatusCodes } from 'http-status-codes';
import { JwtProvider } from '~/providers/JwtProvider';
import { env } from '~/config/environment';
import ApiError from '~/utils/ApiError';

// Middleware to check if the user is authorized JWT token from FE
const isAuthorized = async (req, res, next) => {
  // Get accessToken in request cookies from client - withCredentials
  const clientAccessToken = req.cookies?.accessToken;

  // Check if the accessToken exists
  if (!clientAccessToken) {
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Access token is required')
    );
    return;
  }
  try {
    // Verify the accessToken using the public key
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_PRIVATE_KEY
    );

    // Check if the accessToken is valid, save decoded data to req.jwtDecoded to use in next middlewares
    req.jwtDecoded = accessTokenDecoded;

    // If the accessToken is valid, proceed to the next middleware
    next();
  } catch (error) {
    // If the accessToken is expired, return an error GONE - 410
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh access token'));
      return;
    }
    // If the accessToken is invalid, return an error UNAUTHORIZED - 401 and sign out user
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'));
  }
};

export const authMiddleware = {
  isAuthorized,
};
