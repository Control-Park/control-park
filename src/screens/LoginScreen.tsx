import React from "react";
import { Text, ScrollView, View, TouchableOpacity } from "react-native";
import InputFields from "../components/InputFields";
import CustomButton from "../components/CustomButton";
import AppleIcon from "../../assets/apple-logo.png";
import GoogleIcon from "../../assets/google-logo.png";

export default function LoginScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Top section - Tabs */}
      <View className="flex-1 w-full items-center justify-center">
        <View className="mt-28">
          <View className="flex flex-row justify-center items-center">
            <TouchableOpacity>
              <Text className="text-[#ECAA00] text-2xl font-bold mr-28">
                Log in
              </Text>
              <View className="h-[3px] w-[40%] bg-[#ECAA00] mt-1" />
            </TouchableOpacity>

            <View className="flex">
              <TouchableOpacity className="flex items-center justify-center">
                <Text className="text-[#bbbbbb] text-2xl font-bold">
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Form Section */}
        <View className="px-6 mt-4 max-w-md w-full">
          <InputFields label="Your Email*" placeholder="Enter your email" /> 
          <InputFields
            label="Password*"
            placeholder="Enter password"
            secureTextEntry={true}
          />
         <View className="flex-row items-center justify-end mb-4"> 
          <TouchableOpacity>
            <Text className="text-[#ECAA00] font-semibold text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>
         </View>

          {/* Social Login */}
          <CustomButton
            title="Continue"
            color="#ECAA00"
            className="flex items-center justify-center"
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
              Don't have an Account? 
            </Text>
            <TouchableOpacity>
              {/* TODO: implement forgot password/password reset frontend component - angel */}
              <Text className="text-[#ECAA00] font-bold ml-1.5 tracking-wide text-xl">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
