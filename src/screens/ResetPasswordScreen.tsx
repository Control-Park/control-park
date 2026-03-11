import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid =
    email.trim().length > 0 &&
    otp.trim().length === 6 &&
    newPassword.trim().length >= 6;

  const handleResetPassword = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);

      const response = await fetch("http://localhost:9001/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      console.log("reset-password status:", response.status);
      console.log("reset-password response:", data);

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to reset password.");
        return;
      }

      Alert.alert("Success", "Password reset successfully.");
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Set a new password</Text>

        <Text style={styles.subtitle}>
          Create a new password. Ensure it differs from previous ones for security
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>OTP Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isValid ? "#E6A800" : "#E8D6A2" },
          ]}
          disabled={!isValid || loading}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Update Password"}
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