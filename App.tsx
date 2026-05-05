import "./global.css";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "./src/screens/SplashScreen";

import AppNavigator from "./src/navigation/AppNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./src/navigation/navigationRef";

import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/ToastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePushNotifications } from "./src/hooks/usePushNotifications";
import { PaymentMethodsProvider } from "./src/context/paymentMethodsContext";
import { AuthSessionProvider } from "./src/context/AuthSessionContext";

const queryClient = new QueryClient();

export default function App() {
  usePushNotifications(queryClient);

  const [fontsLoaded] = useFonts({
    "ABeeZee-Regular": require("./assets/fonts/ABeeZee-Regular.ttf"),
    "ABeeZee-Italic": require("./assets/fonts/ABeeZee-Italic.ttf"),
  });

  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <AuthSessionProvider>
            <PaymentMethodsProvider>
              <View className="flex-1">
                <StatusBar barStyle="dark-content" />
                {isShowSplash ? <SplashScreen /> : <AppNavigator />}
              </View>
            </PaymentMethodsProvider>
          </AuthSessionProvider>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
