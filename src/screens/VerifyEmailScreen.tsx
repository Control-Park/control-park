import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { OtpInput } from "react-native-otp-entry";
import CustomButton from "../components/CustomButton";
import { supabase } from "../utils/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "Email">;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const formatEmail = (email: string) => {
    if (!email) return "your email";
    const [localPart, domain] = email.split('@');
    if (localPart.length > 5) {
      return `${localPart.substring(0, 3)}...${localPart.substring(localPart.length - 2)}@${domain}`;
    }
    return email;
  };

  const handleVerifyCode = async () => {
  if (otpCode.length !== 6) {
    Alert.alert("Error", "Please enter the 6-digit code");
    return;
  }

  setIsVerifying(true);
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'recovery',
    });

    if (error) {
      Alert.alert("Verification Failed", error.message);
      return;
    }

    Alert.alert("Success", "Email verified! You can now reset your password.");
    navigation.navigate("ResetPassword", { email });
    
  } catch (error) {
    Alert.alert("Error", "Something went wrong. Please try again.");
  } finally {
    setIsVerifying(false);
  }
};

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        email,
        type: 'email',
      });

      if (error) {
        if (error.status === 429) {
          Alert.alert("Too Many Requests", "Please wait a minute before requesting again.");
        } else {
          Alert.alert("Failed to Resend", error.message);
        }
        return;
      }

      Alert.alert("Success", "A new verification code has been sent to your email.");
      
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 w-full items-center justify-center">
        <View className="px-6 mt-4 max-w-md w-full">
          <View className="mt-8">
            <Text className="text-xl font-bold">Check your email</Text>
            <View className="mt-4">
              <Text className="text-md font-bold text-[#8a8a8a]">
                We sent a reset link to{" "}
                <Text className="font-bold text-black">
                  {formatEmail(email)}
                </Text>
              </Text>
              <Text className="text-md font-bold text-[#8a8a8a]">
                Enter the 6-digit code that was sent to your email
              </Text>
            </View>

            <View className="my-4">
              <OtpInput
                numberOfDigits={6}
                focusColor="blue"
                secureTextEntry={false}
                focusStickBlinkingDuration={500}
                textInputProps={{ accessibilityLabel: "One-Time Password" }}
                onTextChange={(text) => setOtpCode(text)}
                theme={{
                  pinCodeContainerStyle: styles.pinCodeContainerStyle,
                }}
              />
            </View>

            <CustomButton
              title={isVerifying ? "Verifying..." : "Verify Code"}
              color="#ECAA00"
              className="flex items-center justify-center"
              onPress={handleVerifyCode}
              disabled={isVerifying || otpCode.length !== 6}
            />
          </View>
        </View>

        <View className="mb-auto items-center justify-end">
          <View className="flex-row mt-8">
            <Text className="text-gray-500 font-semibold text-lg">
              Haven't got the email yet?
            </Text>
            <TouchableOpacity 
              onPress={handleResendEmail}
              disabled={isResending}
            >
              <Text className="text-[#ECAA00] font-bold ml-1.5 tracking-wide text-lg underline">
                {isResending ? "Sending..." : "Resend email"}
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
});