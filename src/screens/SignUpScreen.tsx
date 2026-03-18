import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useSignUp, SignUpFields } from "../utils/UseSignUp";
import SignUpForm from "../Forms/SignUpForm";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

const DEFAULT_FIELDS: SignUpFields = {
  fullName: "",
  email: "",
  birthDate: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};
import { useSocialAuth } from "../utils/useSocialAuth"; 

export default function SignUpScreen({ navigation }: Props) {
  const [fields, setFields] = useState<SignUpFields>(DEFAULT_FIELDS);

  const { loading, errorFields, submit } = useSignUp();

  const handleChange = (key: keyof SignUpFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => submit(fields);
  const { loading: socialLoading, handleGoogleLogin} = useSocialAuth();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 w-full items-center justify-center">
        {/* Tab Header */}
        <View className="mt-8">
          <View className="flex-row justify-center items-center">
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="text-[#bbbbbb] text-2xl font-bold mr-28">
                Log in
              </Text>
            </TouchableOpacity>

            <View>
              <Text className="text-[#ECAA00] text-2xl font-bold">Sign up</Text>
              <View className="h-[3px] w-full max-w-sm bg-[#ECAA00] mt-1" />
            </View>
          </View>
        </View>

        {/* Form */}
        <SignUpForm
          fields={fields}
          errors={errorFields}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onGoogleLogin={handleGoogleLogin} 
          socialLoading={socialLoading}     
        />

        {/* Footer */}
        <View className="mb-auto items-center justify-end">
          <View className="flex-row mt-4">
            <Text className="text-gray-500 font-semibold text-xl">
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="text-[#ECAA00] font-bold ml-1.5 tracking-wide text-xl">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
