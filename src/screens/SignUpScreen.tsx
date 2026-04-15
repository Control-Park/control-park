import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useSignUp, SignUpFields } from "../utils/UseSignUp";
import SignUpForm from "../Forms/SignUpForm";
import { useSocialAuth } from "../utils/useSocialAuth";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

const DEFAULT_FIELDS: SignUpFields = {
  fullName: "",
  email: "",
  birthDate: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpScreen({ navigation }: Props) {
  const [fields, setFields] = useState<SignUpFields>(DEFAULT_FIELDS);
  const [otpValue, setOtpValue] = useState("");

  const { loading, errorFields, pendingEmail, submit, verifyOtp } = useSignUp();
  const { loading: socialLoading, handleGoogleLogin } = useSocialAuth();

  const handleChange = (key: keyof SignUpFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 w-full items-center justify-center">
          <View className="mt-8">
            <View className="flex-row justify-center items-center">
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-[#bbbbbb] text-2xl font-bold mr-28">Log in</Text>
              </TouchableOpacity>
              <View>
                <Text className="text-[#ECAA00] text-2xl font-bold">Sign up</Text>
                <View className="h-[3px] w-full max-w-sm bg-[#ECAA00] mt-1" />
              </View>
            </View>
          </View>

          <SignUpForm
            fields={fields}
            errors={errorFields}
            loading={loading}
            onChange={handleChange}
            onSubmit={() => submit(fields)}
            onGoogleLogin={handleGoogleLogin}
            socialLoading={socialLoading}
          />

          <View className="mb-auto items-center justify-end">
            <View className="flex-row mt-4">
              <Text className="text-gray-500 font-semibold text-xl">Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-[#ECAA00] font-bold ml-1.5 tracking-wide text-xl">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Email OTP verification modal */}
      <Modal visible={!!pendingEmail} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{"\n"}{pendingEmail}
            </Text>

            <TextInput
              value={otpValue}
              onChangeText={(t) => setOtpValue(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              placeholderTextColor="#9A9A9A"
              keyboardType="number-pad"
              style={styles.otpInput}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => void verifyOtp(otpValue)}
              disabled={loading || otpValue.length !== 6}
            >
              {loading
                ? <ActivityIndicator color="#111" />
                : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  otpInput: {
    width: "100%",
    height: 48,
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 8,
    color: "#111",
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#ECAA00",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
});
