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
  isValidPassword,
} from "../utils/validation";
type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // main handler
  const handleSignUp = async () => {
    // TODO: implement input sanitation for all input fields
    // 1. NAME
    if (
      !fullName.trim() ||
      !isValidName(fullName) ||
      fullName.trim().split(" ").length < 2
    ) {
      showFieldError("name", "Please enter your first and last name");
      return;
    }

    // 2. EMAIL
    if (!email.trim() || !isValidEmail(email)) {
      showFieldError("email", "Enter a valid email address");
      return;
    }

    // 3. BIRTH DATE
    if (!isValidBirthDate(birthDate)) {
      showFieldError("birth date", "Use MM/DD/YYYY format");
      return;
    }

    // 4. PHONE NUMBER
    if (!isValidPhone(phoneNumber)) {
      showFieldError("phone number", "Enter 10 digits");
      return;
    }

    // 5. PASSWORD VALIDATION
    if (!isValidPassword(password)) {
      showFieldError("password requirements", "Min. 6 chars, 1 uppercase, 1 special character");
      return;
    }

    // 6. PASSWORD CONFIRMATION
    if (password !== confirmPassword) {
      showFieldError("matching password", "Passwords do not match!");
      return;
    }

    // SUCCESSFUL = Proceed with signup
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0]; // firstName[0] for "initial" lettered profile picture
    const lastName = nameParts.slice(1).join(" ");

    // save to supabase with url
    // await supabase.from("users").insert({
    //   first_name: firstName,
    //   last_name: lastName,
    //   birth_date: birthDate
    //   phone: phoneNumber
    //   password: password
    //   (email?) : email
    // });
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
          />
          <InputFields
            label="Your Email*"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
          />
          <InputFields
            label="Birth date*"
            placeholder="mm/dd/yyyy"
            value={birthDate}
            onChangeText={(date) => {
              const formatted = formatDate(date);
              setBirthDate(formatted);
            }}
          />
          <InputFields
            label="Phone Number*"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={(num) => {
              const formatted = formatPhoneNumber(num);
              setPhoneNumber(formatted);
            }}
          />
          <InputFields
            label="Password*"
            placeholder="Enter password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <InputFields
            label=""
            placeholder="Confirm password"
            className="-mt-4"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
