import Toast from "react-native-toast-message";

export const VALIDATION = {
  NAME: /^[a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+){0,2}[.]{0,1}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  BIRTH: /^\d{2}\/\d{2}\/\d{4}$/,
};

export const showFieldError = (field: string, message: string) => {
  Toast.show({
    type: "error",
    text1: `Invalid ${field}`,
    text2: message,
    topOffset: 100,
  });
  console.log(`${field} error`);
};

export const showFieldSuccess = (field: string, message: string) => {
  Toast.show({
    type: "success",
    text1: `Valid ${field}`,
    text2: message,
    topOffset: 100,
  });
  // console.log(`${field} valid`);
};

export const showSavedSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: "Listing Saved",
    text2: message,
    topOffset: 100,
  });
};

export const showSavedRemove = (message: string) => {
  Toast.show({
    type: "error",
    text1: "Listing removed",
    text2: message,
    topOffset: 100,
  });
};

export const reserveSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: "Successful reservation",
    text2: message,
    topOffset: 100,
  });
};

export const showNotification = (title: string, body: string) => {
  Toast.show({
    type: "success",
    text1: title,
    text2: body,
    topOffset: 100,
  });
};

export const reserveCancel = (message: string) => {
  Toast.show({
    type: "error",
    text1: "Reservation canceled",
    text2: message,
    topOffset: 100,
  });
};

export const sanitizeCardNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, 16);

export const formatCardNumber = (value: string) => {
  const digits = sanitizeCardNumber(value);
  return digits.match(/.{1,4}/g)?.join("-") ?? "";
};

export const sanitizeCvv = (value: string) => value.replace(/\D/g, "").slice(0, 4);

export const isValidExpiryDate = (value: string) =>
  /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);

export const sanitizeExpiry = (value: string) => value.replace(/\D/g, "").slice(0, 4);

export const formatExpiry = (value: string) => {
  const digits = sanitizeExpiry(value);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const sanitizePostal = (value: string) => value.replace(/\D/g, "").slice(0, 5);


export const formatDate = (text: string) => {
  // Remove all non-digits
  const cleaned = text.replace(/\D/g, "");

  // Format as MM/DD/YYYY
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

export const formatPhoneNumber = (text: string) => {
  const cleaned = text.replace(/\D/g, "");

  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6)
    return `(${cleaned.slice(0, 3)})-${cleaned.slice(3, 6)}`;
  return `(${cleaned.slice(0, 3)})-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

export const isValidBirthDate = (date: string): boolean => {
  // Check format MM/DD/YYYY
  if (!VALIDATION.BIRTH.test(date)) return false;

  const [month, day, year] = date.split("/").map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() + 1 === month &&
    dateObj.getDate() === day
  );
};

export const isValidName = (name: string): boolean =>
  VALIDATION.NAME.test(name.trim());
export const isValidEmail = (email: string): boolean =>
  VALIDATION.EMAIL.test(email.trim());
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");

  return cleaned.length === 10;
};

export const isStrongPassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= 6 && hasUpperCase && hasLowerCase && hasNumbers;
};
