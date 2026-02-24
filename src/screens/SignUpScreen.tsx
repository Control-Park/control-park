import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import InputFields from "../components/InputFields";

export default function SignUpScreen() {


  return (
    <View className="flex-1 bg-white items-center">

      {/* Top section - Tabs */}
      <View className="mt-12">
        <View className="flex-row space-x-20">
          <TouchableOpacity>
            <Text className="text-[#bbbbbb] text-xl font-bold">Log in</Text>
          </TouchableOpacity>

          {/* Active tab with custom underline */}
          <View className="items-center">
            <TouchableOpacity>
              <Text className="text-[#ECAA00] text-xl font-bold">Sign up</Text>
              <View className="h-[3px] w-full bg-[#ECAA00] mt-1" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Form Section */}
      <View className="w-full max-w-md px-6 mt-8">
        <InputFields label="Full name*" placeholder="Enter full name"/>
        <InputFields label="Your Email*" placeholder="Enter your email"/>
        <InputFields label="Birth date*" placeholder="mm/dd/yyyy" />
        <InputFields label="Phone Number*" placeholder="Enter your phone number" />
        <InputFields label="Password*" placeholder="Enter password" />
        <InputFields label="" placeholder="Confirm password" className="-mt-2"/>
      </View>

      {/* Bottom - Already have account? */}
      <View className="flex-1 justify-end mb-4">
        <View className="flex-row space-x-1">
          <Text className="text-[#7a7a7a]">Already have an account?</Text>
          <TouchableOpacity>
            <Text className="text-[#ECAA00] font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
