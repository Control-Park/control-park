import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { showFieldError, showFieldSuccess } from "../utils/validation";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const baseUrl = process.env.SERVER_URL;

export const useSocialAuth = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState({
    google: false,
    apple: false,
  });

  const handleGoogleLogin = async () => {
    setLoading(prev => ({ ...prev, google: true }));
    try {
      const res = await fetch(`${baseUrl}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        console.log("Google login success:", data);
        showFieldSuccess("success", "Login successful!");
        navigation.navigate("Home");
      } else {
        showFieldError("login", data?.message || "Google login failed");
      }
    } catch (err) {
      console.log("Google login error:", err);
      showFieldError("login", "Network error. Check your connection.");
    } finally {
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleAppleLogin = async () => {
    setLoading(prev => ({ ...prev, apple: true }));
    try {
      const res = await fetch(`${baseUrl}/auth/apple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        console.log("Apple login success:", data);
        showFieldSuccess("success", "Login successful!");
        navigation.navigate("Home");
      } else {
        showFieldError("login", data?.message || "Apple login failed");
      }
    } catch (err) {
      console.log("Apple login error:", err);
      showFieldError("login", "Network error. Check your connection.");
    } finally {
      setLoading(prev => ({ ...prev, apple: false }));
    }
  };

  return {
    loading,
    handleGoogleLogin,
    handleAppleLogin,
  };
};