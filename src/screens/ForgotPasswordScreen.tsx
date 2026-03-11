import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { supabase } from "../utils/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.length > 0;

  const handleResetPassword = async () => {
    if (!email.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:8081/auth/callback",
      });
      
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      
      navigation.navigate("Email", { email });
      
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
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
            { backgroundColor: isValid && !isLoading ? "#E6A800" : "#E8D6A2" },
          ]}
          disabled={!isValid || isLoading}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Sending..." : "Reset Password"}
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