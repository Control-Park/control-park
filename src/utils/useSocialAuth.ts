import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "./supabase";
import { RootStackParamList } from "../navigation/AppNavigator";
import { showFieldError, showFieldSuccess } from "../utils/validation";

WebBrowser.maybeCompleteAuthSession();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useSocialAuth = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState({
    google: false,
    apple: false,
  });

  const handleGoogleLogin = async () => {
    setLoading(prev => ({ ...prev, google: true }));
    try {
      const redirectUrl = Linking.createURL("auth/callback");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        showFieldError("login", "Google login failed");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === "success") {
        // Parse the session tokens from the deep link URL fragment
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken || !refreshToken) {
          showFieldError("login", "Google login failed");
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          showFieldError("login", sessionError.message);
          return;
        }

        showFieldSuccess("success", "Login successful!");
        navigation.navigate("Home");
      } else if (result.type === "cancel") {
        // User closed the browser without completing login — no error needed
      }
    } catch (err) {
      console.error("Google login error:", err);
      showFieldError("login", "Network error. Check your connection.");
    } finally {
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleAppleLogin = async () => {
    setLoading(prev => ({ ...prev, apple: true }));
    try {
      const redirectUrl = Linking.createURL("auth/callback");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        showFieldError("login", "Apple login failed");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === "success") {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken || !refreshToken) {
          showFieldError("login", "Apple login failed");
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          showFieldError("login", sessionError.message);
          return;
        }

        showFieldSuccess("success", "Login successful!");
        navigation.navigate("Home");
      }
    } catch (err) {
      console.error("Apple login error:", err);
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
