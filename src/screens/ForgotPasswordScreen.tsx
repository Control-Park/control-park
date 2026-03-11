import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = email.trim().length > 0;

  const handleForgotPassword = async () => {
  if (!isValid || loading) return;

  try {
    setLoading(true);

    const response = await fetch("http://localhost:9001/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
      }),
    });

    const data = await response.json();

    console.log("forgot-password status:", response.status);
    console.log("forgot-password response:", data);

    if (!response.ok) {
      Alert.alert("Error", data.message || "Failed to send reset code.");
      return;
    }

    Alert.alert("Success", "Reset code sent to your email.");
    navigation.navigate("ResetPassword");
  } catch (error) {
    console.error("Forgot password error:", error);
    Alert.alert("Error", "Could not connect to the server.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Forgot password</Text>

        <Text style={styles.subtitle}>
          Please enter your email to reset the password
        </Text>

        <Text style={styles.label}>Your Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isValid ? "#E6A800" : "#E8D6A2" },
          ]}
          disabled={!isValid || loading}
          onPress={handleForgotPassword}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Reset Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  formContainer: {
    width: 350,
    maxWidth: "90%",
    alignSelf: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },

  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    fontWeight: "600",
  },
});