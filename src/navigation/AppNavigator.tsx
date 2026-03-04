import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";

export type RootStackParamList = {
  // change type based on parameters a screen expects to receive
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  // TODO: add userId and profile and send those as parameters into necessary screens
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      {/* screenOptions={headerShown: false} */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Log in" }}
      />
      <Stack.Screen
        name="Signup"
        component={SignUpScreen}
        options={{ title: "Sign up" }}
      />
    </Stack.Navigator>
  );
}
