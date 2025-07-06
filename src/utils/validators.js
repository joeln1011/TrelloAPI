export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
export const OBJECT_ID_RULE_MESSAGE = {
  'string.pattern.base': 'Your string fails to match the Object Id pattern!',
};

// Regular expression and error messages for validation
export const FIELD_REQUIRED_MESSAGE = {
  'string.pattern.base': 'This field is required',
};
export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_RULE_MESSAGE = {
  'string.pattern.base': 'Invalid email format.',
};
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,256}$/;
export const PASSWORD_RULE_MESSAGE = {
  'string.pattern.base':
    'Password must be at least 8 characters long and contain at least one letter and one number',
};

export const PASSWORD_CONFIRMATION_MESSAGE = {
  'string.pattern.base': 'Passwords do not match',
};

export const LIMIT_COMMON_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOW_COMMON_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
