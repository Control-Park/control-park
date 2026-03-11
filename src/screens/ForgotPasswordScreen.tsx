import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { supabase } from "../utils/supabase";

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = email.trim().length > 0;

  const handleResetPassword = async () => {
    if (!email.trim() || loading) return;
    
    setLoading(true);
    try {
      // Use Supabase to send reset password email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:8081/auth/callback",
      });
      
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      
      // Navigate to Email screen with the email parameter
      navigation.navigate("Email", { email: email.trim() });
      
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
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
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Reset Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles remain exactly the same...
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