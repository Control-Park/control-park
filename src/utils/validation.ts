import Toast from "react-native-toast-message";

export const VALIDATION = {
  NAME: /^[a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+){0,2}[.]{0,1}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  BIRTH: /^\d{2}\/\d{2}\/\d{4}$/,
  PHONE: / /,
  PASSWORD: / /,
};

export const showFieldError = (field: string, message: string) => {
  Toast.show({
    type: "error",
    text1: `Invalid ${field}`,
    text2: message,
    topOffset: 100,
  });
  console.log(`${field} error`)
};

export const formatDate = (text: string) => {
  // Remove all non-digits
  const cleaned = text.replace(/\D/g, '');
  
  // Format as MM/DD/YYYY
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
};

export const isValidBirthDate = (date: string): boolean => {
  // Check format MM/DD/YYYY
  if (!VALIDATION.BIRTH.test(date)) return false;
  
  const [month, day, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() + 1 === month &&
    dateObj.getDate() === day
  );
};

export const isValidName = (name: string): boolean => VALIDATION.NAME.test(name.trim());
export const isValidEmail = (email: string): boolean => VALIDATION.EMAIL.test(email.trim());
// export const isValidPhone = (email: string): boolean => VALIDATION.EMAIL.test(email.trim());
// export const isValidPassword = (email: string): boolean => VALIDATION.EMAIL.test(email.trim());