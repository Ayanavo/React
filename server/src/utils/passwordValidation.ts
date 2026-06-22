export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_PATTERN_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
