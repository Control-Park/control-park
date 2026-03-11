import { useSignUp } from "../utils/UseSignUp";
import { useSocialAuth } from "./useSocialAuth";
import { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { showFieldError, showFieldSuccess } from "../utils/validation";

const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useAuth = (navigation: NavigationProp) => {
  const signUp = useSignUp();
  const social = useSocialAuth();
  const [loading, setLoading] = useState({ email: false });

  // Email login
  const handleEmailLogin = async (email: string, password: string) => {
    setLoading(prev => ({ ...prev, email: true }));
    try {
      const res = await fetch(`${baseUrl}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showFieldSuccess("success", "Login successful!");
        navigation.navigate("Home");
        return true;
      } else {
        showFieldError("login", data?.message || "Login failed");
        return false;
      }
    } catch (err) {
      showFieldError("login", "Network error");
      return false;
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  return {
    signUp: {
      loading: signUp.loading,
      errorFields: signUp.errorFields,
      submit: signUp.submit,
    },
    social: {
      loading: social.loading,
      handleGoogleLogin: social.handleGoogleLogin,
      handleAppleLogin: social.handleAppleLogin,
    },
    email: {
      loading: loading.email,
      handleLogin: handleEmailLogin,
    },
  };
};