import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function ForgotPasswordScreen() {

  const [email, setEmail] = useState("");

  const isValid = email.length > 0;

  return (
    <View style={styles.container}>

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
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isValid ? "#E6A800" : "#E8D6A2" }
        ]}
        disabled={!isValid}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center"
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 10
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 30
  },

  label: {
    fontSize: 14,
    marginBottom: 6
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20
  },

  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center"
  },

  buttonText: {
    fontWeight: "600"
  }

});