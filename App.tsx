import "./global.css";
import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import SplashScreen from "./src/screens/SplashScreen";
// import SignUpScreen from "./src/screens/SignUpScreen";

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
      <View className="flex-1 bg-gray-300">
        <StatusBar barStyle="dark-content" />
        {isShowSplash ? <SplashScreen /> : <HomeScreen />}
        {/* <SignUpScreen /> */}
      </View>
    </SafeAreaProvider>
  );
}