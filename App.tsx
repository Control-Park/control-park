import "./global.css";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "./src/screens/SplashScreen";

import AppNavigator from "./src/navigation/AppNavigator";
import { NavigationContainer } from "@react-navigation/native";

import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/ToastConfig";

export default function App() {
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
    <SafeAreaProvider>
      <NavigationContainer>
        <View className="flex-1">
          <StatusBar barStyle="dark-content" />
          {isShowSplash ? <SplashScreen /> : <AppNavigator />}
        </View>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
