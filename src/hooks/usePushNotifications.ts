import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken } from "../api/notifications";
import { supabase } from "../utils/supabase";
import { showNotification } from "../utils/validation";

// Controls how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:9001";
// Convert http(s) to ws(s) for the WebSocket connection
const WS_URL = SERVER_URL.replace(/^http/, "ws");

export function usePushNotifications() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    registerToken();

    // Fires when a notification is received while the app is foregrounded (dev builds)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      },
    );

    // Fires when the user taps a notification (dev builds)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response.notification.request.content.data);
      },
    );

    // WebSocket connection for real-time in-app notifications
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;

      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onmessage = (event) => {
        try {
          const { body, title } = JSON.parse(event.data as string) as {
            body: string;
            title: string;
          };
          showNotification(title, body);
        } catch {
          console.warn("Failed to parse WebSocket message:", event.data);
        }
      };

      ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };

      wsRef.current = ws;
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      wsRef.current?.close();
    };
  }, []);
}

async function registerToken() {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.MAX,
      name: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted");
    return;
  }

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    return;
  }

  let tokenData: Notifications.ExpoPushToken;
  try {
    tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
  } catch (err) {
    // Expo Go SDK 53+ does not support remote push notifications — requires a development build
    console.warn("Push token registration skipped (not supported in this environment):", err);
    return;
  }

  await registerPushToken(tokenData.data);
}
