// Input validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.trim());
};

const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateUsername = (username) => {
  // 3-30 chars, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username?.trim());
};

const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\-\+\(\)\s]{10,}$/;
  return phoneRegex.test(phone?.trim());
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateRequired = (value) => {
  return value && String(value).trim().length > 0;
};

const validateRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

const validateString = (value, minLength = 1, maxLength = 1000) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

const validateArrayOf = (arr, validator) => {
  return Array.isArray(arr) && arr.every(validator);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validatePhone,
  validateUrl,
  validateRequired,
  validateRange,
  validateString,
  validateArrayOf
};
