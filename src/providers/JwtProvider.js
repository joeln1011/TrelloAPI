import JWT from 'jsonwebtoken';

// function create a JWT token need 3 parameters: userInfo, privateKey, and tokenLife
const generateToken = async (userInfo, privateKey, tokenExpired) => {
  try {
    return JWT.sign(userInfo, privateKey, {
      algorithm: 'HS256', // Use HS256 algorithm for signing the token
      expiresIn: tokenExpired, // Set the expiration time for the token
    });
  } catch (error) {
    throw new Error(error);
  }
};

// function to verify a JWT token need 2 parameters: token and privateKey
const verifyToken = async (token, privateKey) => {
  try {
    // Verify the token of JWT using the private key
    return JWT.verify(token, privateKey);
  } catch (error) {
    throw new Error(error);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken,
};
