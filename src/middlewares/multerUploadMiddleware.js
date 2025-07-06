import multer from 'multer';
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
} from '~/utils/validators';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

// Function check if the file type is allowed
const customFileFilter = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage =
      'File type is not supported. Only accepted types are: png, jpg, jpeg.';
    return callback(
      new ApiError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, errorMessage),
      null
    );
  }
  return callback(null, true);
};

// Create Multer storage configuration
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter,
});

export const multerUploadMiddleware = { upload };
