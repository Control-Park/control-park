import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import InputFields from "../components/InputFields";
import CustomButton from "../components/CustomButton";
import AppleIcon from "../../assets/apple-logo.png";
import GoogleIcon from "../../assets/google-logo.png";
import HidePasswordIcon from "../../assets/hide.png";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { supabase } from "../lib/supabase";
import {
  VALIDATION,
  showFieldError,
  isValidName,
  isValidEmail,
  isValidBirthDate,
  formatDate,
  formatPhoneNumber,
  isValidPhone,
  isStrongPassword,
} from "../utils/validation";
type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorFields, setErrorFields] = useState({
    name: false,
    email: false,
    birthDate: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  // main handler
  const handleSignUp = async () => {
    // TODO: implement input sanitation for all input fields
    setErrorFields({
      name: false,
      email: false,
      birthDate: false,
      phone: false,
      password: false,
      confirmPassword: false,
    });

    let hasError = false;

    // Check fields in REVERSE order (bottom to top)
    // 6. CONFIRM PASSWORD
    if (password !== confirmPassword) {
      setErrorFields((prev) => ({ ...prev, confirmPassword: true }));
      showFieldError("matching password", "Passwords do not match!");
      hasError = true;
    }

    // 5. PASSWORD
    if (!isStrongPassword(password)) {
      setErrorFields((prev) => ({ ...prev, password: true }));
      showFieldError("password", "Min. 6 chars, 1 uppercase, 1 special");
      hasError = true;
    }

    // 4. PHONE
    if (!isValidPhone(phoneNumber)) {
      setErrorFields((prev) => ({ ...prev, phone: true }));
      showFieldError("phone number", "Enter 10 digits");
      hasError = true;
    }

    // 3. BIRTH DATE
    if (!isValidBirthDate(birthDate)) {
      setErrorFields((prev) => ({ ...prev, birthDate: true }));
      showFieldError("birth date", "Use MM/DD/YYYY format");
      hasError = true;
    }

    // 2. EMAIL
    if (!email.trim() || !isValidEmail(email)) {
      setErrorFields((prev) => ({ ...prev, email: true }));
      showFieldError("email", "Enter a valid email address");
      hasError = true;
    }

    // 1. NAME (check last so it shows FIRST/TOP)
    if (
      !fullName.trim() ||
      !isValidName(fullName) ||
      fullName.trim().split(" ").length < 2
    ) {
      setErrorFields((prev) => ({ ...prev, name: true }));
      showFieldError("name", "Please enter your first and last name");
      hasError = true;
    }

    // SUCCESSFUL = Proceed with signup
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0]; // firstName[0] for "initial" lettered profile picture
    const lastName = nameParts.slice(1).join(" ");

    // 1. Create auth user (this handles password)
    // const { data: authData, error: authError } = await supabase.auth.signUp({
    //   email: email,
    //   password: password,
    // });

    // save to supabase with url
    // await supabase.from("users").insert({
    //   first_name: firstName,
    //   last_name: lastName,
    //   birth_date: birthDate
    //   phone: phoneNumber
    //   (email?) : email
    // });

    // TESTING
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Top section - Tabs */}
      <View className="flex-1 w-full items-center justify-center">
        <View className="mt-8">
          <View className="flex flex-row justify-center items-center">
            <TouchableOpacity>
              <Text
                className="text-[#bbbbbb] text-2xl font-bold mr-28"
                onPress={() => navigation.navigate("Login")}
              >
                Log in
              </Text>
            </TouchableOpacity>

            {/* Active tab with custom underline */}
            {/* TODO: redirect to Login screen once implemented */}
            <View className="flex">
              <TouchableOpacity className="flex items-center justify-center">
                <Text className="text-[#ECAA00] text-2xl font-bold">
                  Sign up
                </Text>
                <View className="h-[3px] w-[150%] bg-[#ECAA00] mt-1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Form Section */}
        {/* TODO: redirect user to next input field when pressing "enter" */}
        {/* TODO: implement input sanitations */}
        <View className="px-6 mt-4 max-w-md w-full">
          {/* json that can parse all fields */}
          {/* validation and save the information as json format */}
          {/* axios // fetch */}
          {/* special characters */}

          <InputFields
            label="Your Full name*"
            placeholder="Enter full name"
            value={fullName}
            onChangeText={setFullName}
            hasError={errorFields.name}
          />
          <InputFields
            label="Your Email*"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            hasError={errorFields.email}
          />
          <InputFields
            label="Birth date*"
            placeholder="mm/dd/yyyy"
            value={birthDate}
            onChangeText={(date) => {
              const formatted = formatDate(date);
              setBirthDate(formatted);
            }}
            hasError={errorFields.birthDate}
          />
          <InputFields
            label="Phone Number*"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={(num) => {
              const formatted = formatPhoneNumber(num);
              setPhoneNumber(formatted);
            }}
            hasError={errorFields.phone}
          />
          <InputFields
            label="Password*"
            placeholder="Enter password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            hasError={errorFields.password}
          />
          <InputFields
            label=""
            placeholder="Confirm password"
            className="-mt-4"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            hasError={errorFields.confirmPassword}
          />

          {/* Social Login */}
          {/* TODO: implement OAuth sign-in with logo, e.g., apple/google login */}
          <CustomButton
            title="Continue"
            color="#ECAA00"
            className="flex items-center justify-center"
            onPress={handleSignUp} // test
          />
          <View className="flex-row items-center justify-center mx-5 my-3">
            <View className="h-[2px] w-[30%] bg-gray-300" />
            <Text className="mx-4 text-gray-400 font-bold tracking-tighter">
              Or
            </Text>
            <View className="h-[2px] w-[30%] bg-gray-300" />
          </View>

          <View className="flex-col">
            <CustomButton
              title="Login with Apple"
              color="white"
              className="flex-row items-center justify-center border-2 border-gray-300 mb-2"
              localImg={AppleIcon}
            ></CustomButton>
            <CustomButton
              title="Login with Google"
              color="white"
              className="flex-row items-center justify-center border-2 border-gray-300 mb-1"
              localImg={GoogleIcon}
            />
          </View>
        </View>

        {/* Redirect to login frame if user has account */}
        <View className="mb-auto items-center justify-end">
          <View className="flex-row mt-4">
            <Text className="text-gray-500 font-semibold text-xl">
              Already have an account?
            </Text>
            <TouchableOpacity>
              {/* TODO: build log in screen frontend component - hoa */}
              {/* TODO: implement forgot password/password reset frontend component - angel */}
              <Text
                className="text-[#ECAA00] font-bold ml-1.5 tracking-wide text-xl"
                onPress={() => navigation.navigate("Login")}
              >
                Login
              </Text>
              <Text
                className="text-[#ECAA00] font-bold ml-1.5 tracking-wide text-xl"
                onPress={() => navigation.navigate("Email")}
              >
                Verify Email test
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
