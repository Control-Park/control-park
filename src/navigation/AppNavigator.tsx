import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import EmailScreen from "../screens/VerifyEmailScreen";
import DetailsScreen from "../screens/DetailsScreen";
import TestScreen from "../screens/TestScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";


export type RootStackParamList = {
  // change type based on parameters a screen expects to receive
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined; 
  Email: {
    email: string;
    userData?: {
      first_name: string;
      last_name: string;
      birth_date: string;
      phone: string;
    }
  }
  Details: { id: string };
  Test: undefined;
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
      <Stack.Screen
        name="Email"
        component={EmailScreen}
        options={{ title: "Verify Email" }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: "Details" }}
      />
      <Stack.Screen
      name="Test"
      component={TestScreen}
      />
      <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ title: "Forgot Password" }}
    />
      />
      <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={{ title: "Reset Password"}}
      />
  </Stack.Navigator>
  );
}
