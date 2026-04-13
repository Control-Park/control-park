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
import ReservationsScreen from "../screens/ReservationsScreen";
import ExploreScreen from "../screens/ExploreScreen";
import MessageScreen from "../screens/MessageScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReserveScreen from "../screens/ReserveScreen";
import ActiveReservationScreen from "../screens/ActiveReservationScreen";
import VehicleManagementScreen from "../screens/VehicleManagementScreen";
import NotificationScreen from "../screens/NotificationsScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PaymentScreen from "../screens/PaymentScreen";

export type RootStackParamList = {
  // change type based on parameters a screen expects to receive
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  Email: {
    email: string;
    userData?: {
      first_name: string;
      last_name: string;
      birth_date: string;
      phone: string;
    };
  };
  Details: { id: string };
  Test: undefined;
  Reservations: undefined;
  Explore: undefined;
  Message: undefined;
  Profile: undefined;
  Reserve: { id: string };
  ActiveReservation: { reservationId: string };
  VehicleManagement: undefined;
  Notification: undefined;
  NotificationSettings: undefined;
  Payment: undefined;
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
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: "Forgot Password" }}
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
        name="Reserve"
        component={ReserveScreen}
        options={{ title: "Reserve" }}
      />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: "Reset Password" }}
      />
      <Stack.Screen
        name="Reservations"
        component={ReservationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Message"
        component={MessageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveReservation"
        component={ActiveReservationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VehicleManagement"
        component={VehicleManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
