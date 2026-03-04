import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import InputFields from "../components/InputFields";
import CustomButton from "../components/CustomButton";
import AppleIcon from "../../assets/apple-logo.png";
import GoogleIcon from "../../assets/google-logo.png";
import HidePasswordIcon from "../../assets/hide.png";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
type Props = NativeStackScreenProps<RootStackParamList, "Email">;

import { OtpInput } from "react-native-otp-entry";


export default function VerifyEmailScreen({ navigation }: Props) {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Top section - Tabs */}
      <View className="flex-1 w-full items-center justify-center">
    

        {/* Form Section */}
        {/* TODO: redirect user to next input field when pressing "enter" */}
        {/* TODO: implement input sanitations */}
        <View className="px-6 mt-4 max-w-md w-full">
            <View className="mt-8">
                <Text className="text-xl font-bold">Check your email</Text>
                <View className="mt-4">
                <Text className="text-md font-bold text-[#8a8a8a]">We sent a reset link to&nbsp;
                    <Text className="font-bold text-black">
                        first.last@csulb...
                    </Text>
                </Text>
                <Text className="text-md font-bold text-[#8a8a8a]">enter a 5 digit code that was sent to the email</Text>
                </View>
                
                {/* TODO: placeholder for OTP code, will add  */}
                <View className="my-4">
                    <OtpInput numberOfDigits={6}
                    focusColor={"blue"}
                    // type="numeric"
                    secureTextEntry={false}
                    focusStickBlinkingDuration={500}
                    textInputProps={{accessibilityLabel: "One-Time Password",}}
                    onTextChange={(text) => console.log(text)} 
                    theme={{
                        pinCodeContainerStyle: styles.pinCodeContainerStyle,
                    }}
                    />
                </View>

                {/* TODO: connect verify code button after all input fields are entered */}
                <CustomButton
                    title="Verify Code"
                    color="#ECAA00"
                    className="flex items-center justify-center"
                />
            </View>
          
        </View>

        {/* Redirect to login frame if user has account */}
        <View className="mb-auto items-center justify-end">
          <View className="flex-row mt-8">
            <Text className="text-gray-500 font-semibold text-lg">
              Haven't got the email yet?
            </Text>
            <TouchableOpacity>
              {/* TODO: build log in screen frontend component - hoa */}
              {/* TODO: implement forgot password/password reset frontend component - angel */}
              <Text
                className="text-[#ECAA00] font-bold ml-1.5 tracking-wide text-lg underline"
                onPress={() => navigation.navigate("Login")}
              >
                Resend email
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    pinCodeContainerStyle: {
        width: 52,
    },
})