import "./global.css";
import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "./src/screens/SplashScreen";

import AppNavigator from "./src/navigation/AppNavigator";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
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
    </SafeAreaProvider>
  );
}
