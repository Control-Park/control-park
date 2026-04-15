import { useState } from "react";
import { signUpUser, verifySignUpOtp } from "../utils/AuthService";
import { showFieldError, showFieldSuccess } from "../utils/validation";
import {
  isValidName,
  isValidEmail,
  isValidBirthDate,
  isValidPhone,
  isStrongPassword,
} from "../utils/validation";
import { useNavigation } from "@react-navigation/native"; 
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

export interface SignUpFields {
  fullName: string;
  email: string;
  birthDate: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface FieldErrors {
  name: boolean;
  email: boolean;
  birthDate: boolean;
  phone: boolean;
  password: boolean;
  confirmPassword: boolean;
}

const DEFAULT_ERRORS: FieldErrors = {
  name: false,
  email: false,
  birthDate: false,
  phone: false,
  password: false,
  confirmPassword: false,
};

const toISODate = (mmddyyyy: string): string => {
  const [mm, dd, yyyy] = mmddyyyy.split("/");
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useSignUp() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [errorFields, setErrorFields] = useState<FieldErrors>(DEFAULT_ERRORS);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const setFieldError = (field: keyof FieldErrors) =>
    setErrorFields((prev) => ({ ...prev, [field]: true }));

  const validate = (fields: SignUpFields): boolean => {
    setErrorFields(DEFAULT_ERRORS);
    let hasError = false;

    // Checked in reverse so top-most field error shows last (Toast shows latest)
    if (fields.password !== fields.confirmPassword) {
      setFieldError("confirmPassword");
      showFieldError("matching password", "Passwords do not match!");
      return false; // early return — no point checking further
    }

    if (!isStrongPassword(fields.password)) {
      setFieldError("password");
      showFieldError("password", "Min. 6 chars, 1 uppercase, 1 special");
      hasError = true;
    }

    if (!isValidPhone(fields.phoneNumber)) {
      setFieldError("phone");
      showFieldError("phone number", "Enter 10 digits");
      hasError = true;
    }

    if (!isValidBirthDate(fields.birthDate)) {
      setFieldError("birthDate");
      showFieldError("birth date", "Use MM/DD/YYYY format");
      hasError = true;
    }

    if (!fields.email.trim() || !isValidEmail(fields.email)) {
      setFieldError("email");
      showFieldError("email", "Enter a valid email address");
      hasError = true;
    }

    if (
      !fields.fullName.trim() ||
      !isValidName(fields.fullName) ||
      fields.fullName.trim().split(" ").length < 2
    ) {
      setFieldError("name");
      showFieldError("name", "Please enter your first and last name");
      hasError = true;
    }

    return !hasError;
  };
  

  const submit = async (fields: SignUpFields) => {
    if (!validate(fields)) return;

    const [firstName, ...rest] = fields.fullName.trim().split(" ");
    const lastName = rest.join(" ");

    setLoading(true);
    try {
      await signUpUser({
        email: fields.email.trim(),
        password: fields.password,
        first_name: firstName,
        last_name: lastName,
        birth_date: toISODate(fields.birthDate),
        phone: fields.phoneNumber.replace(/\D/g, ""),
      });

      showFieldSuccess("success", "Check your email for a verification code.");
      setPendingEmail(fields.email.trim());
    } catch (error: any) {
      showFieldError("signup", error.message ?? "Network error. Check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    if (!pendingEmail) return;
    setLoading(true);
    try {
      await verifySignUpOtp(pendingEmail, otp);
      showFieldSuccess("success", "Account created! Please login.");
      setPendingEmail(null);
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (error: any) {
      showFieldError("signup", error.message ?? "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return { loading, errorFields, pendingEmail, submit, verifyOtp };
}