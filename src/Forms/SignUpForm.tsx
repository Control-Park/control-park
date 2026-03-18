import React from "react";
import { Text, View } from "react-native";
import InputFields from "../components/InputFields";
import CustomButton from "../components/CustomButton";
import GoogleIcon from "../../assets/google-logo.png";
import { FieldErrors, SignUpFields } from "../utils/UseSignUp";
import { formatDate, formatPhoneNumber } from "../utils/validation";

interface SignUpFormProps {
  fields: SignUpFields;
  errors: FieldErrors;
  loading: boolean;
  onChange: (key: keyof SignUpFields, value: string) => void;
  onSubmit: () => void;
  onGoogleLogin?: () => void;
  socialLoading?: {
    google: boolean;
  };
}

export default function SignUpForm({
  fields,
  errors,
  loading,
  onChange,
  onSubmit,
  onGoogleLogin,
  socialLoading = { google: false},
}: SignUpFormProps) {
  return (
    <View className="px-6 mt-4 max-w-md w-full">
      <InputFields
        label="Your Full name*"
        placeholder="Enter full name"
        value={fields.fullName}
        onChangeText={(v) => onChange("fullName", v)}
        hasError={errors.name}
      />
      <InputFields
        label="Your Email*"
        placeholder="Enter your email"
        value={fields.email}
        onChangeText={(v) => onChange("email", v)}
        hasError={errors.email}
      />
      <InputFields
        label="Birth date*"
        placeholder="mm/dd/yyyy"
        value={fields.birthDate}
        onChangeText={(v) => onChange("birthDate", formatDate(v))}
        hasError={errors.birthDate}
      />
      <InputFields
        label="Phone Number*"
        placeholder="Enter your phone number"
        value={fields.phoneNumber}
        onChangeText={(v) => onChange("phoneNumber", formatPhoneNumber(v))}
        hasError={errors.phone}
      />
      <InputFields
        label="Password*"
        placeholder="Enter password"
        secureTextEntry
        value={fields.password}
        onChangeText={(v) => onChange("password", v)}
        hasError={errors.password}
      />
      <InputFields
        label=""
        placeholder="Confirm password"
        className="-mt-4"
        secureTextEntry
        value={fields.confirmPassword}
        onChangeText={(v) => onChange("confirmPassword", v)}
        hasError={errors.confirmPassword}
      />

      <CustomButton
        title={loading ? "Creating account..." : "Sign up"}
        color="#ECAA00"
        className="flex items-center justify-center"
        onPress={onSubmit}
      />

      {/* Divider */}
      <View className="flex-row items-center justify-center mx-5 my-3">
        <View className="h-[2px] w-[30%] bg-gray-300" />
        <View className="mx-4">
          <Text>Or</Text>
        </View>
        <View className="h-[2px] w-[30%] bg-gray-300" />
      </View>

      <View className="flex-col">
        <CustomButton
          title="Login with Google"
          color="white"
          className="flex-row items-center justify-center border-2 border-gray-300 mb-1"
          localImg={GoogleIcon}
          onPress={onGoogleLogin}
          disabled={socialLoading.google}
        />
      </View>
    </View>
  );
}
