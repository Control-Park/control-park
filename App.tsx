import "./global.css";
import { View, Text, StatusBar } from "react-native";
import SignUpScreen from "./src/screens/SignUpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SplashScreen from "./src/screens/SplashScreen"
import { useEffect, useState } from "react";

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);
  });
  
  return (
    <View className="flex-1 bg-gray-300">
      <StatusBar barStyle="dark-content" />
      
      <>{isShowSplash ? <SplashScreen /> : <HomeScreen />}</>
      {/* <SignUpScreen /> */}
    </View>
  );
}
