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
import MessageScreen from "../screens/MessageScreen";
import HostProfileScreen from "../screens/HostProfileScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReserveScreen from "../screens/ReserveScreen";
import ActiveReservationScreen from "../screens/ActiveReservationScreen";
import VehicleManagementScreen from "../screens/VehicleManagementScreen";
import NotificationScreen from "../screens/NotificationsScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PaymentScreen from "../screens/PaymentScreen";
import PersonalInfoScreen from "../screens/PersonalInfoScreen";
import ConversationScreen from "../screens/ConversationScreen";
import GuestProfileScreen from "../screens/GuestProfileScreen";
import HostReservationsScreen from "../screens/HostReservationsScreen";
import CreateListingScreen from "../screens/CreateListingScreen";
import EditListingScreen from "../screens/EditListingScreen";
import GuestReviewsScreen from "../screens/GuestReviewsScreen";
import ViewProfileScreen from "../screens/ViewProfileScreen";

export type RootStackParamList = {
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
  Reservations: { refreshKey?: string } | undefined;
  Message:
    | {
        hostId?: string;
        hostName?: string;
        listingId?: string;
        listingImage?: any;
        listingTitle?: string;
      }
    | undefined;
  Conversation: {
    listingId: string;
    hostId: string;
    guestId?: string;
    conversationId?: string;
    hostName?: string;
    listingTitle?: string;
    listingImage?: any;
  };
  Profile: { refreshKey?: string } | undefined;
  ProfileSettings: undefined;
  GuestProfile: { guestId: string; reservationId: string };
  Reserve: { id: string };
  ActiveReservation: { reservationId: string };
  VehicleManagement: undefined;
  Notification: undefined;
  NotificationSettings: undefined;
  Payment: undefined;
  PersonalInfo: undefined;
  HostReservations: undefined;
  CreateListing: undefined;
  EditListing: { listing: import("../types/listing").Listing };
  GuestReviews: {
    guestId: string;
    guestName: string;
  };
  ViewProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
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
        name="Message"
        component={MessageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={HostProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileSettings"
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
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GuestProfile"
        component={GuestProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HostReservations"
        component={HostReservationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditListing"
        component={EditListingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GuestReviews"
        component={GuestReviewsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ViewProfile"
        component={ViewProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
