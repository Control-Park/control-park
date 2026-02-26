import "./global.css";
import { View, Text, StatusBar } from "react-native";
import SignUpScreen from "./src/screens/SignUpScreen";

export default function App() {
  return (
    <View className="flex-1 bg-gray-300">
      <StatusBar barStyle="dark-content" />
      {/* TODO: Build frontend component for splash screen */}
      {/* <SplashScreen />  */}
      
      <SignUpScreen />
    </View>
  );
}
